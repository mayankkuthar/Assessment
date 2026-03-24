// Simple test for clipboard functionality
// This can be run in browser console to test clipboard functionality

import { copyToClipboard, showClipboardFeedback } from './clipboard.js'

// Test function that can be called from browser console
window.testClipboard = async () => {
  console.log('Testing clipboard functionality...')
  
  const testText = 'https://example.com/test-quiz-link'
  
  try {
    const success = await copyToClipboard(testText)
    console.log('Clipboard test result:', success ? 'SUCCESS' : 'FAILED')
    
    if (success) {
      console.log('✅ Clipboard functionality is working!')
      showClipboardFeedback(true, 'Test successful! Clipboard is working.')
    } else {
      console.log('❌ Clipboard functionality failed')
      showClipboardFeedback(false)
    }
  } catch (error) {
    console.error('Clipboard test error:', error)
    showClipboardFeedback(false)
  }
}

console.log('Clipboard test function loaded. Run testClipboard() in console to test.')

