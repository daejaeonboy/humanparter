import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebase';
import { getUserProfileByFirebaseUid } from '../../src/api/userApi';
import { getAuthErrorMessage } from '../../src/utils/authErrors';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfileByFirebaseUid(userCredential.user.uid);

      if (!profile) {
        await auth.signOut();
        setError('등록되지 않은 계정입니다.');
        return;
      }

      if (!profile.is_admin) {
        await auth.signOut();
        setError('관리자 권한이 없는 계정입니다.');
        return;
      }

      if (!profile.is_approved) {
        await auth.signOut();
        setError('관리자 승인 후 로그인할 수 있습니다.');
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Admin login failed:', err);
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

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
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#001e45] py-3 font-semibold text-white transition-colors hover:bg-[#002d66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  로그인 중...
                </>
              ) : (
                '관리자 로그인'
              )}
            </button>
          </form>

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
