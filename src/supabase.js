import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Please create a .env file in your project root with:')
  console.error('VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key_here')
  console.error('You can find these values in your Supabase dashboard under Settings > API')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 