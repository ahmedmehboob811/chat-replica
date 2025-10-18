import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real application, you would replace these with your own
// Supabase project URL and anon key, likely from environment variables.
// The placeholder values below are validly formatted to prevent the app from crashing.
const supabaseUrl = 'https://xyzcompany.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get an authenticated Supabase client
export const getSupabaseClient = (accessToken: string) => {
    if (!accessToken) return supabase;

    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });

    return authenticatedClient;
};