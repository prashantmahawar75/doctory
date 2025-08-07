// Supabase Configuration
//const supabaseUrl = 
// const supabaseKey = ;

// Create Supabase client
try {
    // Check if Supabase is loaded
    if (typeof supabase === 'undefined') {
        throw new Error('Supabase is not loaded. Make sure the Supabase script is included and loaded properly.');
    }

    // Initialize the Supabase client
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    // Make it globally available
    window.supabaseClient = supabaseClient;
    
    // Test the connection and database tables
    async function testConnection() {
        try {
            console.log('Testing database connection...');
            
            const tables = ['doctors', 'patients', 'schedules', 'appointments'];
            const results = await Promise.all(tables.map(async table => {
                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select('count', { count: 'exact', head: true });
                        
                    if (error) {
                        if (error.code === 'PGRST301') {
                            console.warn(`No access to ${table} table. This might be due to RLS policies.`);
                            return { table, status: 'limited', error: error.message };
                        }
                        throw new Error(`${table} table error: ${error.message}`);
                    }
                    
                    console.log(`✓ ${table} table OK`);
                    return { table, status: 'ok' };
                } catch (error) {
                    console.error(`× ${table} table error:`, error);
                    return { table, status: 'error', error: error.message };
                }
            }));

            const errors = results.filter(r => r.status === 'error');
            if (errors.length > 0) {
                console.error('Some tables had errors:', errors);
                return false;
            }

            const limited = results.filter(r => r.status === 'limited');
            if (limited.length > 0) {
                console.warn('Some tables have limited access:', limited);
            }

            console.log('✓ All database tables verified');
            return true;
        } catch (error) {
            console.error('Database test failed:', error);
            return false;
        }
    }

    // Make supabase available globally
    window.supabase = supabase;
    
    // Run connection test and show UI feedback
    testConnection().then(success => {
        if (success) {
            console.log('Supabase client initialized and connected successfully');
        } else {
            console.error('Supabase connection test failed');
            // Show user-friendly error message if we're not on the auth page
            if (!window.location.pathname.includes('auth.html')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-error';
                errorDiv.style.position = 'fixed';
                errorDiv.style.top = '20px';
                errorDiv.style.right = '20px';
                errorDiv.style.zIndex = '9999';
                errorDiv.textContent = 'Connection to the database failed. Please try refreshing the page.';
                document.body.appendChild(errorDiv);
            }
        }
    });

} catch (error) {
    console.error('Failed to initialize Supabase client:', error);

}
