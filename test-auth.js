// Test authentication setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://voosuqmkazvjzheipbrl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3N1cW1rYXp2anpoZWlwYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjAxNzcsImV4cCI6MjA2ODU5NjE3N30.AU0ew4-Un_g4nLkdGXcwSfIj6R1mwY_JDbHcSXJFe0E';

console.log('🔧 Environment Check:');
console.log('Supabase URL:', supabaseUrl);
console.log('Has Anon Key:', !!supabaseKey);
console.log('Key preview:', supabaseKey.substring(0, 20) + '...');

// Test if we can create a Supabase client
try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // Test basic auth
    supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
            console.log('❌ Session check failed:', error.message);
        } else {
            console.log('✅ Session check successful');
            console.log('Current session:', data.session ? 'Active' : 'None');
        }
    }).catch(err => {
        console.log('❌ Session check error:', err.message);
    });
    
} catch (err) {
    console.log('❌ Failed to create Supabase client:', err.message);
}

console.log('\n📋 Checklist for login issues:');
console.log('1. Check Google OAuth settings in Supabase dashboard');
console.log('2. Verify redirect URLs are configured correctly');
console.log('3. Check if profiles table exists and has proper RLS policies');
console.log('4. Test with both email/password and Google OAuth');
console.log('5. Check browser console for specific error messages');
