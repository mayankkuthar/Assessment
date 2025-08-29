#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Supabase Environment Setup')
console.log('=============================\n')

const envPath = path.join(__dirname, '.env')

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!')
  const content = fs.readFileSync(envPath, 'utf8')
  if (content.includes('your-project-id') || content.includes('your_anon_key_here')) {
    console.log('❌ Please update the placeholder values in your .env file with your actual Supabase credentials.')
  } else {
    console.log('✅ .env file appears to be configured.')
  }
} else {
  console.log('📝 Creating .env file...')
  
  const envContent = `# Supabase Configuration
# Replace these placeholder values with your actual Supabase project credentials
# You can find these in your Supabase dashboard under Settings > API

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created successfully!')
  console.log('📋 Please update the placeholder values with your actual Supabase credentials.')
}

console.log('\n📖 Instructions:')
console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
console.log('2. Select your project (or create a new one)')
console.log('3. Go to Settings > API')
console.log('4. Copy your Project URL and anon/public key')
console.log('5. Replace the placeholder values in the .env file')
console.log('6. Restart your development server: npm run dev')
console.log('\n🔗 For more help, see SUPABASE_SETUP.md') 