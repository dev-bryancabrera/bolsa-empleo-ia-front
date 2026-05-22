import { createClient } from '@supabase/supabase-js';
import { getEnvVariables } from '@/core/helpers/getEnvVariable';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getEnvVariables();

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
