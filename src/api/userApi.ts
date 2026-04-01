import { supabase } from '../lib/supabase';
import { auth } from '../firebase';

export interface UserProfile {
    id?: string;
    firebase_uid: string;
    email: string;
    name: string;
    phone: string;
    company_name: string;
    department?: string;
    position?: string;
    address?: string;
    business_number?: string;
    business_license_url?: string;
    member_type?: 'business' | 'public';
    manager_name?: string;
    is_admin?: boolean;
    is_approved?: boolean;
    agreed_terms: boolean;
    agreed_privacy: boolean;
    agreed_marketing?: boolean;
    created_at?: string;
}

interface AuthIdentity {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    providerIds?: string[];
}

// 사용자 프로필 생성
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'created_at' | 'is_admin'>): Promise<UserProfile> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([profile])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Firebase UID로 사용자 프로필 조회
export const getUserProfileByFirebaseUid = async (firebaseUid: string): Promise<UserProfile | null> => {
    if (!firebaseUid?.trim()) {
        return null;
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
};

export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
        return null;
    }

    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
};

// 모든 사용자 조회 (Admin용)
export const getUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

// 사용자 프로필 수정
export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const resolveUserProfileForAuthIdentity = async ({
    uid,
    email,
    displayName,
}: AuthIdentity): Promise<UserProfile | null> => {
    const profileByUid = await getUserProfileByFirebaseUid(uid);
    if (profileByUid) {
        return profileByUid;
    }

    if (!email) {
        return null;
    }

    const profileByEmail = await getUserProfileByEmail(email);
    if (!profileByEmail || !profileByEmail.id) {
        return null;
    }

    if (profileByEmail.firebase_uid === uid) {
        return profileByEmail;
    }

    return updateUserProfile(profileByEmail.id, {
        firebase_uid: uid,
        email: email.trim().toLowerCase(),
        name: displayName?.trim() || profileByEmail.name,
    });
};

// 사용자 삭제
export const deleteUserProfile = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// 사용자 검색
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const getAuthenticatedApiHeaders = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('로그인이 필요합니다.');
    }

    const idToken = await currentUser.getIdToken();
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
    };
};

const getApiBaseUrl = () => {
    if (!API_BASE_URL) {
        throw new Error('계정 보안 정보 변경 API가 아직 설정되지 않았습니다.');
    }

    return API_BASE_URL;
};

// Firebase 이메일 변경 (서버 API 호출)
export const updateFirebaseEmail = async (firebaseUid: string, newEmail: string): Promise<void> => {
    const response = await fetch(`${getApiBaseUrl()}/api/users/update-email`, {
        method: 'PUT',
        headers: await getAuthenticatedApiHeaders(),
        body: JSON.stringify({ firebaseUid, newEmail })
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || '이메일 변경에 실패했습니다.');
    }
};

// Firebase 비밀번호 변경 (서버 API 호출)
export const updateFirebasePassword = async (firebaseUid: string, newPassword: string): Promise<void> => {
    const response = await fetch(`${getApiBaseUrl()}/api/users/update-password`, {
        method: 'PUT',
        headers: await getAuthenticatedApiHeaders(),
        body: JSON.stringify({ firebaseUid, newPassword })
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || '비밀번호 변경에 실패했습니다.');
    }
};
