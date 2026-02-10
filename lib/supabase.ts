
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if we have a valid URL and key
const isValidUrl = supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');
export const supabase = isValidUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null as any;
