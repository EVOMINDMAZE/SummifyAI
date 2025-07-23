import { createClient } from '@supabase/supabase-js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to execute raw SQL queries using Supabase
export async function executeQuery(query: string, params: any[] = []) {
  console.log('🔌 Executing query via Supabase:', query.substring(0, 100) + '...')

  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query,
      params: params
    })

    if (error) {
      console.error('❌ Supabase query error:', error)
      throw error
    }

    console.log('✅ Query executed successfully')
    return { rows: data || [] }
  } catch (error) {
    console.error('❌ Query execution failed:', error)
    // Fallback: use Supabase client methods for basic queries
    throw error
  }
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
