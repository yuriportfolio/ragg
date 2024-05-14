'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = redis.pipeline()
    const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string) {
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null
  }

  return chat
}

export async function clearChats(userId: string) {
  const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1)
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }
  const pipeline = redis.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  redirect('/')
}

export async function saveChat(chat: Chat) {
  const pipeline = redis.pipeline()
  pipeline.hmset(`chat:${chat.id}`, chat)
  pipeline.zadd(`user:chat:${chat.userId}`, {
    score: Date.now(),
    member: `chat:${chat.id}`
  })
  await pipeline.exec()
}

export async function deleteChat(id: string, userId: string) {
  const pipeline = redis.pipeline()
  pipeline.del(`chat:${id}`)
  pipeline.zrem(`user:chat:${userId}`, `chat:${id}`)
  await pipeline.exec()

  revalidatePath('/')
  redirect('/')
}

export async function updateChat(chat: Chat) {
  await redis.hmset(`chat:${chat.id}`, chat)
}

export async function createChat(chat: Chat): Promise<string> {
  const id = `${chat.userId}:${Date.now()}`
  await redis.hmset(`chat:${id}`, { ...chat, id })
  await redis.zadd(`user:chat:${chat.userId}`, {
    score: Date.now(),
    member: `chat:${id}`
  })

  return id
}

export async function getChatMessages(chatId: string) {
  const messages: string[] = await redis.lrange(`chat:${chatId}:messages`, 0, -1)
  return messages
}

export async function addChatMessage(chatId: string, message: string) {
  await redis.rpush(`chat:${chatId}:messages`, message)
}

export async function clearChatMessages(chatId: string) {
  await redis.del(`chat:${chatId}:messages`)
}

export async function updateChatMessage(chatId: string, messageIndex: number, message: string) {
  await redis.lset(`chat:${chatId}:messages`, messageIndex, message)
}

export async function deleteChatMessage(chatId: string, messageIndex: number) {
  await redis.lset(`chat:${chatId}:messages`, messageIndex, '')
}

export async function createChatMessage(chatId: string, message: string) {
  await redis.rpush(`chat:${chatId}:messages`, message)
}

export async function getChatMessage(
  chatId: string,
  messageIndex: number,
  userId: string = 'anonymous'
) {
  const message: string = await redis.lindex(`chat:${ chatId }:messages`, messageIndex) || '' 
  return message  
}