import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Direct PostgreSQL connection for complex queries (vector search, etc.)
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL

export async function getSupabaseClient(): Promise<Client> {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  
  await client.connect()
  return client
}

// Types for database entities
export interface Book {
  id: number
  title: string
  author_name?: string
  author?: string
  cover_url?: string
  isbn_13?: string
  created_at?: string
}

export interface Chapter {
  id: number
  book_id: number
  chapter_title: string
  chapter_text: string
  vector_embedding?: number[]
  created_at?: string
}

export interface EnrichedChapter {
  id: number
  title: string
  snippet: string
  relevanceScore: number
  whyRelevant: string
  keyTopics: string[]
  coreLeadershipPrinciples: string[]
  practicalApplications: string[]
  aiExplanation?: string
}

export interface BookGroup {
  id: string
  title: string
  author: string
  cover: string
  isbn: string
  averageRelevance: number
  topChapters: EnrichedChapter[]
}

export interface SearchResults {
  query: string
  searchType: string
  totalBooks: number
  totalChapters: number
  books: BookGroup[]
  processingTime?: number
}

export interface TopicAnalysis {
  isBroad: boolean
  explanation: string
  refinements: Array<{
    label: string
    value: string
    description: string
  }>
}
