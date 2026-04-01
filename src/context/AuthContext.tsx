import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../api/userApi';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

type AuthRuntime = {
    auth: (typeof import('../firebase'))['auth'];
    onAuthStateChanged: (typeof import('firebase/auth'))['onAuthStateChanged'];
    signOut: (typeof import('firebase/auth'))['signOut'];
    resolveUserProfileForAuthIdentity: (typeof import('../api/userApi'))['resolveUserProfileForAuthIdentity'];
};

let authRuntimePromise: Promise<AuthRuntime> | null = null;
const PROFILE_LOOKUP_TIMEOUT_MS = 8000;
const AUTH_BOOTSTRAP_TIMEOUT_MS = 3000;

const hasStoredAuthSession = () => {
    if (typeof window === 'undefined') return false;

    try {
        return Object.keys(window.localStorage).some((key) => key.startsWith('firebase:authUser:'));
    } catch {
        return false;
    }
};

const shouldBootstrapAuthForPath = (pathname: string) =>
    pathname.startsWith('/admin') || hasStoredAuthSession();

const loadAuthRuntime = async (): Promise<AuthRuntime> => {
    if (!authRuntimePromise) {
        authRuntimePromise = Promise.all([
            import('firebase/auth'),
            import('../firebase'),
            import('../api/userApi'),
        ]).then(([firebaseAuth, firebaseModule, userApiModule]) => ({
            auth: firebaseModule.auth,
            onAuthStateChanged: firebaseAuth.onAuthStateChanged,
            signOut: firebaseAuth.signOut,
            resolveUserProfileForAuthIdentity: userApiModule.resolveUserProfileForAuthIdentity,
        }));
    }

    return authRuntimePromise;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
        return await Promise.race([
            promise,
            new Promise<T>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
            }),
        ]);
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(() =>
        typeof window !== 'undefined' ? shouldBootstrapAuthForPath(window.location.pathname) : false,
    );
    const authInitializedRef = useRef(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const authBootstrapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAuthBootstrapTimeout = () => {
        if (authBootstrapTimeoutRef.current) {
            clearTimeout(authBootstrapTimeoutRef.current);
            authBootstrapTimeoutRef.current = null;
        }
    };

    const fetchProfile = async (firebaseUser: User) => {
        try {
            const { auth, signOut, resolveUserProfileForAuthIdentity } = await loadAuthRuntime();
            const profile = await withTimeout(resolveUserProfileForAuthIdentity({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                providerIds: firebaseUser.providerData.map((provider) => provider.providerId),
            }), PROFILE_LOOKUP_TIMEOUT_MS, '사용자 프로필 조회 시간이 초과되었습니다.');
            
            // 승인되지 않은 사용자 로그아웃 처리
            if (profile && !profile.is_approved) {
                if (auth) {
                    await signOut(auth);
                }
                setUser(null);
                setUserProfile(null);
                // alert('관리자 승인이 필요한 계정입니다.'); // 자동 로그인 시 계속 뜰 수 있어 생략하거나 필요 시 추가
                return;
            }

            setUserProfile(profile);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUserProfile(null);
        }
    };

    useEffect(() => {
        let active = true;
        const shouldBootstrap = shouldBootstrapAuthForPath(location.pathname);

        if (!shouldBootstrap) {
            if (!authInitializedRef.current) {
                setLoading(false);
            }
            return;
        }

        if (authInitializedRef.current) {
            return;
        }

        authInitializedRef.current = true;
        setLoading(true);

        const initialize = async () => {
            try {
                const { auth, onAuthStateChanged } = await loadAuthRuntime();
                if (!active || !auth) {
                    if (active) {
                        setLoading(false);
                    }
                    return;
                }

                let receivedInitialAuthState = false;
                const applyAuthState = async (currentUser: User | null) => {
                    receivedInitialAuthState = true;
                    clearAuthBootstrapTimeout();

                    void (async () => {
                        if (!active) return;

                        setLoading(true);
                        setUser(currentUser);

                        try {
                            if (currentUser) {
                                await fetchProfile(currentUser);
                            } else {
                                setUserProfile(null);
                            }
                        } finally {
                            if (active) {
                                setLoading(false);
                            }
                        }
                    })();
                };

                unsubscribeRef.current = onAuthStateChanged(auth, (currentUser) => {
                    void applyAuthState(currentUser);
                });

                authBootstrapTimeoutRef.current = setTimeout(() => {
                    if (!active || receivedInitialAuthState) {
                        return;
                    }

                    console.warn('Auth bootstrap timed out. Falling back to currentUser snapshot.');
                    void applyAuthState(auth.currentUser);
                }, AUTH_BOOTSTRAP_TIMEOUT_MS);
            } catch (error) {
                console.error('Failed to initialize auth session:', error);
                authInitializedRef.current = false;
                clearAuthBootstrapTimeout();
                if (active) {
                    setUser(null);
                    setUserProfile(null);
                    setLoading(false);
                }
            }
        };

        void initialize();

        return () => {
            active = false;
            clearAuthBootstrapTimeout();
        };
    }, [location.pathname]);

    useEffect(() => {
        return () => {
            clearAuthBootstrapTimeout();
            unsubscribeRef.current?.();
        };
    }, []);

    const logout = async () => {
        const { auth, signOut } = await loadAuthRuntime();
        if (auth) {
            await signOut(auth);
        }
        setUserProfile(null);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user);
        }
    };

    const isAdmin = userProfile?.is_admin === true;

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
