// Clear all existing quiz attempts
// Run this script to reset the system for the new scoring system

const clearAttempts = async () => {
  try {
    console.log('🗑️ Clearing all existing quiz attempts...');
    
    const response = await fetch('http://localhost:3001/api/clear-all-attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success:', result.message);
      console.log(`📊 Deleted ${result.deleted_count} attempts`);
    } else {
      console.error('❌ Failed to clear attempts');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the function
clearAttempts();
