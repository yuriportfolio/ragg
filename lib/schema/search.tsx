import { DeepPartial } from 'ai'
import { z } from 'zod'
import { Langfuse } from 'langfuse'
export const searchSchema = z.object({
  query: z.string().describe('The query to search for'),
  max_results: z
    .number()
    .max(20)
    .default(5)
    .describe('The maximum number of results to return'),
  search_depth: z
    .enum(['basic', 'advanced'])
    .default('basic')
    .describe('The depth of the search')
})
//trace the search schema to track the search generated using langfuse 
const langfuse = new Langfuse();
type CreateLangfuseTraceBody = {
  name: string;
  search: PartialSearch;
};
const search: PartialSearch = {}; // Declare or initialize the 'search' variable
langfuse.trace({ name: "searchSchema", search } as CreateLangfuseTraceBody);
export type PartialSearch = DeepPartial<typeof searchSchema>
export type PartialInquiry = DeepPartial<typeof searchSchema>
//trace the search schema to track the search generated using langfuse 
