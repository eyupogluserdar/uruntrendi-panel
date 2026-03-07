import { createClient } from '@supabase/supabase-js';

// NOT: Bu değerler kullanıcı tarafından Supabase panelinden alınmalıdır.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
} else {
    console.log('Supabase client initialized with URL:', supabaseUrl);
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Resmi Supabase Storage'a yükler.
 * @param file Yüklenecek dosya
 * @returns Yüklenen resmin public URL'si
 */
export const uploadImage = async (file: File): Promise<string> => {
    if (!supabase) {
        throw new Error('Supabase bağlantısı henüz kurulmadı. Lütfen API anahtarlarınızı ekleyin.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
};
