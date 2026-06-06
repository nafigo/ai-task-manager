// src/app/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Kasamızdaki (.env.local) gizli şifreleri alıyoruz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase'e bağlanan o köprüyü oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseKey);