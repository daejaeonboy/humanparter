import { supabase } from '../lib/supabase';

export interface QuoteNotificationRecipient {
    id?: string;
    email: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

const TABLE_NAME = 'quote_notification_recipients';
export const DEFAULT_QUOTE_NOTIFICATION_RECIPIENT_EMAILS = ['hm_solution@naver.com'];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isQuoteNotificationRecipientsTableMissingError = (error: unknown): boolean => {
    const code = String((error as { code?: string } | null)?.code || '');
    const message = String((error as { message?: string } | null)?.message || '');

    return code === 'PGRST205' && message.includes(`'public.${TABLE_NAME}'`);
};

export const getQuoteNotificationRecipients = async (): Promise<QuoteNotificationRecipient[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((item) => ({
        ...item,
        email: normalizeEmail(item.email),
    }));
};

export const getAllQuoteNotificationRecipients = async (): Promise<QuoteNotificationRecipient[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((item) => ({
        ...item,
        email: normalizeEmail(item.email),
    }));
};

export const addQuoteNotificationRecipient = async (email: string): Promise<QuoteNotificationRecipient> => {
    const normalizedEmail = normalizeEmail(email);
    const timestamp = new Date().toISOString();

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([
            {
                email: normalizedEmail,
                is_active: true,
                updated_at: timestamp,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return {
        ...data,
        email: normalizedEmail,
    };
};

export const updateQuoteNotificationRecipient = async (
    id: string,
    updates: Partial<Pick<QuoteNotificationRecipient, 'email' | 'is_active'>>,
): Promise<QuoteNotificationRecipient> => {
    const nextUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (typeof updates.email === 'string') {
        nextUpdates.email = normalizeEmail(updates.email);
    }

    if (typeof updates.is_active === 'boolean') {
        nextUpdates.is_active = updates.is_active;
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(nextUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return {
        ...data,
        email: normalizeEmail(data.email),
    };
};

export const deleteQuoteNotificationRecipient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getQuoteNotificationRecipientEmails = async (): Promise<string[]> => {
    try {
        const recipients = await getQuoteNotificationRecipients();
        if (recipients.length === 0) {
            return DEFAULT_QUOTE_NOTIFICATION_RECIPIENT_EMAILS;
        }

        return recipients.map((item) => item.email);
    } catch (error) {
        console.error('Failed to load quote notification recipients. Falling back to the default email.', error);
        return DEFAULT_QUOTE_NOTIFICATION_RECIPIENT_EMAILS;
    }
};
