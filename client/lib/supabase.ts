import { createClient } from '@supabase/supabase-js'
import { Client } from 'pg'

// Supabase configuration
const supabaseUrl = 'https://voosuqmkazvjzheipbrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3N1cW1rYXp2anpoZWlwYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjAxNzcsImV4cCI6MjA2ODU5NjE3N30.AU0ew4-Un_g4nLkdGXcwSfIj6R1mwY_JDbHcSXJFe0E'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Direct PostgreSQL connection for complex queries
const DATABASE_URL = 'postgresql://postgres:yahya3793@db.voosuqmkazvjzheipbrl.supabase.co:5432/postgres'

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
}
