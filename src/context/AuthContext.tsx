import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../api/userApi';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    initialized: boolean;
    isAdmin: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    initialized: false,
    isAdmin: false,
    logout: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

type AuthRuntime = {
    auth: (typeof import('../firebase'))['auth'];
    onAuthStateChanged: (typeof import('firebase/auth'))['onAuthStateChanged'];
    signOut: (typeof import('firebase/auth'))['signOut'];
};

let authRuntimePromise: Promise<AuthRuntime> | null = null;
let profileResolverPromise: Promise<(typeof import('../api/userApi'))['resolveUserProfileForAuthIdentity']> | null = null;
const PROFILE_LOOKUP_TIMEOUT_MS = 8000;

const loadAuthRuntime = async (): Promise<AuthRuntime> => {
    if (!authRuntimePromise) {
        authRuntimePromise = Promise.all([
            import('firebase/auth'),
            import('../firebase'),
        ]).then(([firebaseAuth, firebaseModule]) => ({
            auth: firebaseModule.auth,
            onAuthStateChanged: firebaseAuth.onAuthStateChanged,
            signOut: firebaseAuth.signOut,
        }));
    }

    return authRuntimePromise;
};

const loadProfileResolver = async () => {
    if (!profileResolverPromise) {
        profileResolverPromise = import('../api/userApi').then((userApiModule) => userApiModule.resolveUserProfileForAuthIdentity);
    }

    return profileResolverPromise;
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
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const authStateRequestIdRef = useRef(0);

    const fetchProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
        try {
            const resolveUserProfileForAuthIdentity = await loadProfileResolver();
            return await withTimeout(resolveUserProfileForAuthIdentity({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                providerIds: firebaseUser.providerData.map((provider) => provider.providerId),
            }), PROFILE_LOOKUP_TIMEOUT_MS, '사용자 프로필 조회 시간이 초과되었습니다.');
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    };

    useEffect(() => {
        let active = true;

        const applyAuthState = async (currentUser: User | null) => {
            const requestId = ++authStateRequestIdRef.current;

            if (!active) return;

            setLoading(true);
            setUser(currentUser);

            if (!currentUser) {
                setUserProfile(null);
                setInitialized(true);
                setLoading(false);
                return;
            }

            setUserProfile(null);
            const profile = await fetchProfile(currentUser);

            if (!active || authStateRequestIdRef.current !== requestId) {
                return;
            }

            setUserProfile(profile);
            setInitialized(true);
            setLoading(false);
        };

        const initialize = async () => {
            try {
                const { auth, onAuthStateChanged } = await loadAuthRuntime();
                if (!active || !auth) {
                    if (active) {
                        setInitialized(true);
                        setLoading(false);
                    }
                    return;
                }

                let handledInitialState = false;

                unsubscribeRef.current = onAuthStateChanged(auth, (currentUser) => {
                    handledInitialState = true;
                    void applyAuthState(currentUser);
                });

                await auth.authStateReady();
                if (active && !handledInitialState) {
                    await applyAuthState(auth.currentUser);
                }
            } catch (error) {
                console.error('Failed to initialize auth session:', error);
                if (active) {
                    setUser(null);
                    setUserProfile(null);
                    setInitialized(true);
                    setLoading(false);
                }
            }
        };

        void initialize();

        return () => {
            active = false;
            unsubscribeRef.current?.();
            unsubscribeRef.current = null;
        };
    }, []);

    const logout = async () => {
        setLoading(true);
        const { auth, signOut } = await loadAuthRuntime();
        if (auth) {
            await signOut(auth);
            return;
        }

        setUser(null);
        setUserProfile(null);
        setInitialized(true);
        setLoading(false);
    };

    const refreshProfile = async () => {
        if (!user) {
            setUserProfile(null);
            return;
        }

        setLoading(true);
        const profile = await fetchProfile(user);
        setUserProfile(profile);
        setInitialized(true);
        setLoading(false);
    };

    const isAdmin = userProfile?.is_admin === true;

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, initialized, isAdmin, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
