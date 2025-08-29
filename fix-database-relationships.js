#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Database Relationship Fix')
console.log('============================\n')

const fixPath = path.join(__dirname, 'fix_relationships.sql')

if (fs.existsSync(fixPath)) {
  console.log('✅ Found fix_relationships.sql file')
  const content = fs.readFileSync(fixPath, 'utf8')
  const lines = content.split('\n').length
  console.log(`📄 File contains ${lines} lines of SQL`)
  
  console.log('\n📋 To fix the database relationships:')
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Navigate to the SQL Editor (left sidebar)')
  console.log('4. Copy the entire contents of fix_relationships.sql')
  console.log('5. Paste and run the SQL commands')
  console.log('6. This will create views and functions to fix the relationship issues')
  
  console.log('\n🔧 What this fix does:')
  console.log('   - Creates a view for easy quiz_attempts queries')
  console.log('   - Creates functions for user quiz attempts')
  console.log('   - Creates functions for admin quiz attempts')
  console.log('   - Creates functions for user statistics')
  console.log('   - Fixes the relationship between quiz_attempts and user_roles')
  
  console.log('\n⚠️  Important:')
  console.log('   - This will not affect existing data')
  console.log('   - The functions provide better performance')
  console.log('   - The app will automatically use these functions')
  console.log('   - If functions don\'t exist, the app will fallback to direct queries')
  
} else {
  console.log('❌ fix_relationships.sql file not found!')
  console.log('Please make sure the file exists in your project root.')
}

console.log('\n🔗 For more help, see the database schema documentation.') 