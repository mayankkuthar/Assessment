import copy from 'clipboard-copy'

/**
 * Copy text to clipboard with fallback support
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const copyToClipboard = async (text) => {
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback to clipboard-copy library
    await copy(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    
    // Final fallback - create temporary textarea
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return successful
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}

/**
 * Show user feedback for clipboard operations
 * @param {boolean} success - Whether the copy operation was successful
 * @param {string} message - Custom message to show
 */
export const showClipboardFeedback = (success, message = '') => {
  if (success) {
    // You can replace this with a toast notification library if available
    alert(message || 'Link copied to clipboard!')
  } else {
    alert('Failed to copy link. Please try again or copy manually.')
  }
}

