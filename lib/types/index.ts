export type SearchResults = {
  images: string[]
  results: SearchResultItem[]
  query: string
}

export type SearchResultItem = {
  title: string
  url: string
  content: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: AIMessage[]
  sharePath?: string
}

export type AIMessage = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id: string
  name?: string
  type?:
    | 'answer'
    | 'related'
    | 'skip'
    | 'inquiry'
    | 'input'
    | 'input_related'
    | 'tool'
    | 'followup'
    | 'end'
}
export interface TracingData {
  traceId: string
  spanId: string
  parentId?: string
}

export type TracedAIMessage = AIMessage & TracingData

export interface TracedChat extends Chat {
  traceId: string
}

// Update AIMessage type to include tracing data
export type AIMessageWithTracing = AIMessage & TracingData

// Update Chat interface to include tracing data
export interface ChatWithTracing extends Chat {
  traceId: string
}

// Update SearchResults type to include tracing data
export type SearchResultsWithTracing = SearchResults & TracingData