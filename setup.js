#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Supabase Setup for Assessment Tool\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    console.log('Please provide your Supabase project details:\n');
    
    const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://your-project.supabase.co): ');
    const supabaseKey = await question('Enter your Supabase Anon Key: ');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('\n❌ Both URL and key are required!');
      process.exit(1);
    }
    
    // Create .env file
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}`;
    
    fs.writeFileSync('.env', envContent);
    
    console.log('\n✅ Environment variables saved to .env file!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and run the contents of database_schema.sql');
    console.log('4. Start your development server: npm run dev');
    console.log('\n📖 For detailed instructions, see SUPABASE_SETUP.md');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup(); 