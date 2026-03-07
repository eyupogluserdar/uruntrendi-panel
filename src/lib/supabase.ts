import { createClient } from '@supabase/supabase-js';

// NOT: Bu değerler kullanıcı tarafından Supabase panelinden alınmalıdır.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
