import { supabase } from '../lib/supabase';

export interface FAQ {
    id?: string;
    category: string;
    question: string;
    answer: string;
    display_order: number;
    created_at?: string;
    updated_at?: string;
}

const TABLE_NAME = 'faqs';
const FAQ_TABLE_STATUS_STORAGE_KEY = 'hp_faqs_table_status';
const FAQ_CATEGORY_TABLE_STATUS_STORAGE_KEY = 'hp_faq_categories_table_status';
type TableStatus = 'unknown' | 'available' | 'missing';

let faqTableStatusCache: TableStatus = 'unknown';
let faqCategoryTableStatusCache: TableStatus = 'unknown';

const isMissingTableError = (error: unknown, tableName: string) => {
    if (!error || typeof error !== 'object') return false;
    const maybeError = error as { code?: string; message?: string };
    return maybeError.code === '42P01' || String(maybeError.message || '').toLowerCase().includes(tableName);
};

const createMissingTableError = (tableName: string) => ({
    code: '42P01',
    message: `${tableName} table is missing`,
});

const readStoredTableStatus = (storageKey: string): TableStatus => {
    if (typeof window === 'undefined') return 'unknown';

    try {
        const stored = window.sessionStorage.getItem(storageKey);
        return stored === 'available' || stored === 'missing' ? stored : 'unknown';
    } catch {
        return 'unknown';
    }
};

const writeStoredTableStatus = (storageKey: string, status: Exclude<TableStatus, 'unknown'>) => {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.setItem(storageKey, status);
    } catch {
        // Ignore sessionStorage write failures.
    }
};

const getTableStatus = (
    cacheValue: TableStatus,
    setCacheValue: (status: TableStatus) => void,
    storageKey: string,
) => {
    if (cacheValue !== 'unknown') return cacheValue;
    const stored = readStoredTableStatus(storageKey);
    setCacheValue(stored);
    return stored;
};

const setTableStatus = (
    status: Exclude<TableStatus, 'unknown'>,
    setCacheValue: (status: TableStatus) => void,
    storageKey: string,
) => {
    setCacheValue(status);
    writeStoredTableStatus(storageKey, status);
};

const sortByDisplayOrder = <T extends { display_order?: number; created_at?: string }>(items: T[]) =>
    [...items].sort((a, b) => {
        const aOrder = typeof a.display_order === 'number' ? a.display_order : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.display_order === 'number' ? b.display_order : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aCreatedAt = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreatedAt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aCreatedAt - bCreatedAt;
    });

export const getFAQs = async (): Promise<FAQ[]> => {
    if (
        getTableStatus(
            faqTableStatusCache,
            (status) => {
                faqTableStatusCache = status;
            },
            FAQ_TABLE_STATUS_STORAGE_KEY,
        ) === 'missing'
    ) {
        return [];
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*');

    if (error) {
        if (isMissingTableError(error, TABLE_NAME)) {
            setTableStatus(
                'missing',
                (status) => {
                    faqTableStatusCache = status;
                },
                FAQ_TABLE_STATUS_STORAGE_KEY,
            );
            return [];
        }
        throw error;
    }

    setTableStatus(
        'available',
        (status) => {
            faqTableStatusCache = status;
        },
        FAQ_TABLE_STATUS_STORAGE_KEY,
    );

    return sortByDisplayOrder((data || []) as FAQ[]);
};

export const addFAQ = async (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([faq])
        .select()
        .single();

    if (error) throw error;
    return data.id;
};

export const updateFAQ = async (id: string, faq: Partial<FAQ>): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({
            ...faq,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
};

export const deleteFAQ = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ===== FAQ Categories =====

export interface FAQCategory {
    id?: string;
    name: string;
    display_order: number;
    created_at?: string;
}

const CATEGORY_TABLE = 'faq_categories';

export const getFAQCategories = async (): Promise<FAQCategory[]> => {
    if (
        getTableStatus(
            faqCategoryTableStatusCache,
            (status) => {
                faqCategoryTableStatusCache = status;
            },
            FAQ_CATEGORY_TABLE_STATUS_STORAGE_KEY,
        ) === 'missing'
    ) {
        return [];
    }

    const { data, error } = await supabase
        .from(CATEGORY_TABLE)
        .select('*');

    if (error) {
        if (isMissingTableError(error, CATEGORY_TABLE)) {
            setTableStatus(
                'missing',
                (status) => {
                    faqCategoryTableStatusCache = status;
                },
                FAQ_CATEGORY_TABLE_STATUS_STORAGE_KEY,
            );
            return [];
        }
        throw error;
    }

    setTableStatus(
        'available',
        (status) => {
            faqCategoryTableStatusCache = status;
        },
        FAQ_CATEGORY_TABLE_STATUS_STORAGE_KEY,
    );

    return sortByDisplayOrder((data || []) as FAQCategory[]);
};

export const addFAQCategory = async (category: Omit<FAQCategory, 'id' | 'created_at'>): Promise<string> => {
    const { data, error } = await supabase
        .from(CATEGORY_TABLE)
        .insert([category])
        .select()
        .single();

    if (error) throw error;
    return data.id;
};

export const updateFAQCategory = async (id: string, category: Partial<FAQCategory>): Promise<void> => {
    const { error } = await supabase
        .from(CATEGORY_TABLE)
        .update(category)
        .eq('id', id);

    if (error) throw error;
};

export const deleteFAQCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(CATEGORY_TABLE)
        .delete()
        .eq('id', id);

    if (error) throw error;
};
