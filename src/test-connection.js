import { supabase } from './supabase'

export async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection by trying to fetch profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Connection successful!')
    return { success: true, data }
  } catch (err) {
    console.error('Test failed:', err)
    return { success: false, error: err.message }
  }
} 