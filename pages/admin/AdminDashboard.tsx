import type { ComponentType } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  FileText,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    path: '/admin',
    label: '대시보드',
    description: '관리 첫 화면',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: '/admin/company',
    label: '회사소개 관리',
    description: '회사소개 페이지 콘텐츠 관리',
    icon: Building2,
  },
  {
    path: '/admin/public-visuals',
    label: '공개 비주얼 관리',
    description: '상단 배너와 메가 메뉴 이미지 관리',
    icon: ImageIcon,
  },
  {
    path: '/admin/products',
    label: '상품 관리',
    description: '상품 등록, 수정, 삭제',
    icon: Package,
  },
  {
    path: '/admin/bookings',
    label: '견적 문의 관리',
    description: '견적 요청 확인 및 처리',
    icon: CalendarCheck,
  },
  {
    path: '/admin/inquiries',
    label: '1:1 문의 관리',
    description: '고객 문의 응대 관리',
    icon: MessageSquare,
  },
  {
    path: '/admin/cases',
    label: '설치 사례 관리',
    description: '설치 사례 페이지 데이터 관리',
    icon: ImageIcon,
  },
  {
    path: '/admin/main-reviews',
    label: '메인 리뷰 카드',
    description: '메인 리뷰 섹션 카드 관리',
    icon: ImageIcon,
  },
  {
    path: '/admin/cms',
    label: '콘텐츠 관리',
    description: '메뉴, 배너, 팝업, 로고 관리',
    icon: Settings,
  },
  {
    path: '/admin/faqs',
    label: 'FAQ 관리',
    description: '자주 묻는 질문 관리',
    icon: HelpCircle,
  },
  {
    path: '/admin/notices',
    label: '정보센터 관리',
    description: '정보센터 게시글 관리',
    icon: FileText,
  },
  {
    path: '/admin/users',
    label: '회원 관리',
    description: '회원 확인 및 상태 관리',
    icon: Users,
  },
];

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const isRoot = location.pathname === '/admin';

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    await logout();
    navigate('/admin/login');
  };

  const quickLinks = navItems.filter((item) => item.path !== '/admin');

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              사이트로 이동
            </Link>
            <h1 className="text-xl font-bold text-slate-900">휴먼파트너 관리자</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                {userProfile?.name?.charAt(0) || <User size={14} />}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{userProfile?.name || '관리자'}</p>
                <p className="text-slate-500">{userProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block rounded-xl border px-3 py-2.5 transition ${
                    active
                      ? 'border-[#001e45]/20 bg-[#001e45]/8'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={active ? 'text-[#001e45]' : 'text-slate-500'} />
                    <span className={`text-sm font-semibold ${active ? 'text-[#001e45]' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-[calc(100vh-72px)] flex-1 p-6">
          {isRoot ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">관리 홈</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  안녕하세요, {userProfile?.name || '관리자'}님
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  주요 운영 메뉴를 한곳에서 빠르게 이동할 수 있도록 정리했습니다.
                  아래 바로가기에서 필요한 작업을 선택해 진행하세요.
                </p>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-3 text-slate-700 group-hover:bg-[#001e45] group-hover:text-white">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{item.label}</h3>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </section>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};
