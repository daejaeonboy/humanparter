import { supabase } from '../lib/supabase';

export interface PageContentEntry<T = unknown> {
  id?: string;
  page_key: string;
  content: T;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const isMissingTableError = (error: unknown) => {
  const anyError = error as { code?: string; message?: string };
  return anyError?.code === '42P01' || String(anyError?.message || '').includes('page_contents');
};

export const getPageContentEntry = async <T>(pageKey: string): Promise<PageContentEntry<T> | null> => {
  const { data, error } = await supabase
    .from('page_contents')
    .select('*')
    .eq('page_key', pageKey)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }

  return (data as PageContentEntry<T> | null) || null;
};

export const upsertPageContentEntry = async <T>(
  pageKey: string,
  content: T,
): Promise<PageContentEntry<T>> => {
  const { data, error } = await supabase
    .from('page_contents')
    .upsert(
      [
        {
          page_key: pageKey,
          content,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'page_key' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as PageContentEntry<T>;
};

