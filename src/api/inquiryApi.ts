import { supabase } from '../lib/supabase';

export interface Inquiry {
    id?: string;
    user_id: string;
    user_name?: string;
    user_email?: string;
    company_name?: string;
    category?: string;
    title: string;
    content: string;
    status?: 'pending' | 'answered';
    answer?: string;
    created_at?: string;
    answered_at?: string;
}

const TABLE_NAME = 'inquiries';
export const QUOTE_INQUIRY_CATEGORY = '견적문의';

export const isInquiriesTableMissingError = (error: unknown): boolean => {
    const code = String((error as { code?: string } | null)?.code || '');
    const message = String((error as { message?: string } | null)?.message || '');

    return code === 'PGRST205' && message.includes(`'public.${TABLE_NAME}'`);
};

export interface QuoteInquiryPayload {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    neededProducts: string[];
    rentalStart?: string;
    rentalEnd?: string;
    quantity?: string;
    budget?: string;
    location?: string;
    notes: string;
}

interface QuoteInquiryEnvelope {
    type: 'quote_request_v1';
    payload: QuoteInquiryPayload;
}

const toQuoteInquiryContent = (payload: QuoteInquiryPayload): string => {
    const envelope: QuoteInquiryEnvelope = {
        type: 'quote_request_v1',
        payload,
    };

    return JSON.stringify(envelope);
};

export const parseQuoteInquiryContent = (content: string): QuoteInquiryPayload | null => {
    try {
        const parsed = JSON.parse(content) as Partial<QuoteInquiryEnvelope>;
        if (parsed?.type !== 'quote_request_v1' || !parsed.payload) return null;
        return parsed.payload;
    } catch {
        return null;
    }
};

// 내 문의 목록 조회
export const getMyInquiries = async (userId: string): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// 문의 등록
export const addInquiry = async (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'status' | 'answer' | 'answered_at'>): Promise<string> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([inquiry])
        .select()
        .single();

    if (error) throw error;
    return data.id;
};

// 모든 문의 조회 (관리자용)
export const getAllInquiries = async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// 문의 답변 (관리자용)
export const answerInquiry = async (id: string, answer: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({
            answer,
            status: 'answered',
            answered_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw error;
};

// 문의 삭제
export const deleteInquiry = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const createQuoteInquiry = async (
    payload: QuoteInquiryPayload,
    requester?: {
        userId?: string;
        userName?: string;
        userEmail?: string;
    },
): Promise<string> => {
    const safeUserId = requester?.userId || `guest-${Date.now()}`;
    const title = `[견적문의] ${payload.companyName} / ${payload.contactName}`;

    return addInquiry({
        user_id: safeUserId,
        user_name: requester?.userName || payload.contactName,
        user_email: requester?.userEmail || payload.email,
        company_name: payload.companyName,
        category: QUOTE_INQUIRY_CATEGORY,
        title,
        content: toQuoteInquiryContent(payload),
    });
};

export const getQuoteInquiries = async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('category', QUOTE_INQUIRY_CATEGORY)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};
