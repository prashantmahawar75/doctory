// Global error handler for database operations
window.handleDatabaseError = function(error, context = '') {
    console.error(`Database error ${context}:`, error);
    
    // Create or update error message element
    let errorElement = document.getElementById('database-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'database-error';
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            z-index: 9999;
            max-width: 300px;
        `;
        document.body.appendChild(errorElement);
    }

    // Set error message
    errorElement.textContent = error.message || 'An error occurred while connecting to the database';

    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorElement && errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 5000);
};

// Add global error event listener
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && event.reason.message.includes('supabase')) {
        handleDatabaseError(event.reason);
        event.preventDefault(); // Prevent the default error handling
    }
});
