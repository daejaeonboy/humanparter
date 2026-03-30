import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../../src/firebase';
import { resolveUserProfileForAuthIdentity } from '../../src/api/userApi';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<'password' | 'google' | null>(null);
  const [error, setError] = useState('');

  const finishAdminLogin = async (firebaseUser: User) => {
    const profile = await resolveUserProfileForAuthIdentity({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      providerIds: firebaseUser.providerData.map((provider) => provider.providerId),
    });

    if (!profile) {
      await auth.signOut();
      throw new Error('등록되지 않은 관리자 계정입니다.');
    }

    if (!profile.is_admin) {
      await auth.signOut();
      throw new Error('관리자 권한이 없는 계정입니다.');
    }

    if (!profile.is_approved) {
      await auth.signOut();
      throw new Error('관리자 승인 후 로그인할 수 있습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingMethod('password');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await finishAdminLogin(userCredential.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Admin login failed:', err);
      setError(err?.message || getAuthErrorMessage(err.code));
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoadingMethod('google');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await finishAdminLogin(result.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Admin Google login failed:', err);
      setError(err?.message || getAuthErrorMessage(err.code));
    } finally {
      setLoadingMethod(null);
    }
  };

  const isPasswordLoading = loadingMethod === 'password';
  const isGoogleLoading = loadingMethod === 'google';
  const isLoading = loadingMethod !== null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#001e45]">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-gray-500">휴먼파트너 관리자 페이지</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">관리자 이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                placeholder="admin@humanpartner.kr"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#001e45]"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#001e45] py-3 font-semibold text-white transition-colors hover:bg-[#002d66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPasswordLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  로그인 중...
                </>
              ) : (
                '관리자 로그인'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                구글 로그인 중...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12S6.6 21.8 12 21.8c6.9 0 9.5-4.9 9.5-7.5 0-.5-.1-.9-.1-1.3H12Z" />
                  <path fill="#34A853" d="M3.3 7.3l3.2 2.4C7.3 8 9.4 6 12 6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2c-3.8 0-7.1 2.2-8.7 5.1Z" />
                  <path fill="#FBBC05" d="M2.2 12c0 1.7.4 3.3 1.1 4.7l3.7-2.8c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3.3 7.3A9.7 9.7 0 0 0 2.2 12Z" />
                  <path fill="#4285F4" d="M12 21.8c2.8 0 5.1-.9 6.8-2.5l-3.1-2.4c-.9.6-2.1 1.1-3.7 1.1-2.6 0-4.8-1.8-5.6-4.1l-3.7 2.8c1.6 3 4.8 5.1 8.7 5.1Z" />
                </svg>
                Google로 로그인
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            승인된 관리자 계정과 동일한 Google 이메일로 로그인해야 합니다.
          </p>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link to="/admin/signup" className="font-semibold text-[#001e45] hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 transition-colors hover:text-[#001e45]">
            메인 사이트로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
};
