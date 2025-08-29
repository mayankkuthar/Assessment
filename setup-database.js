#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🗄️  Database Setup Instructions')
console.log('==============================\n')

console.log('📋 To set up your database, follow these steps:\n')

console.log('1. 📖 Go to your Supabase dashboard:')
console.log('   https://supabase.com/dashboard\n')

console.log('2. 🎯 Select your project (the one with URL: dzchzqawbdogqnnkakvf.supabase.co)\n')

console.log('3. 🔧 Navigate to the SQL Editor (left sidebar)\n')

console.log('4. 📝 Copy the entire contents of the database_schema.sql file\n')

console.log('5. 📋 Paste the SQL into the SQL Editor and click "Run"\n')

console.log('6. ✅ Verify that all tables were created by checking the Table Editor\n')

console.log('7. 🔄 Restart your development server: npm run dev\n')

console.log('📁 The database_schema.sql file contains:')
console.log('   - All necessary tables (profiles, packets, questions, quizzes, etc.)')
console.log('   - Row Level Security (RLS) policies')
console.log('   - Indexes for performance')
console.log('   - Triggers for automatic timestamp updates\n')

console.log('⚠️  Important Notes:')
console.log('   - Make sure you\'re in the correct project')
console.log('   - The SQL will create tables if they don\'t exist')
console.log('   - If tables already exist, the script will skip them')
console.log('   - RLS policies will be enabled for security\n')

console.log('🔗 For detailed setup instructions, see SUPABASE_SETUP.md\n')

// Check if database_schema.sql exists
const schemaPath = path.join(__dirname, 'database_schema.sql')
if (fs.existsSync(schemaPath)) {
  console.log('✅ database_schema.sql file found!')
  const content = fs.readFileSync(schemaPath, 'utf8')
  const lines = content.split('\n').length
  console.log(`📄 File contains ${lines} lines of SQL`)
} else {
  console.log('❌ database_schema.sql file not found!')
} 