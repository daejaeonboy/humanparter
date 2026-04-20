import React from 'react';
import { Bell, Boxes, Building2, Headset, LayoutGrid, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { isPublicNavActive, PUBLIC_NAV_ITEMS, type PublicNavIcon } from '../../src/config/publicNavigation';

const navIcons: Record<PublicNavIcon, React.ReactNode> = {
    building2: <Building2 size={18} />,
    layoutGrid: <LayoutGrid size={18} />,
    boxes: <Boxes size={18} />,
    bell: <Bell size={18} />,
    headset: <Headset size={18} />,
    send: <Send size={18} />,
};

export const BottomNav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/80 px-1 backdrop-blur-lg pb-safe-area md:hidden">
            <div className="flex h-16 items-center justify-around">
                {PUBLIC_NAV_ITEMS.map((item) => {
                    const isActive = isPublicNavActive(location.pathname, item);
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 transition-all duration-300 ${
                                isActive ? 'scale-105 text-[#001e45]' : 'text-slate-400'
                            }`}
                        >
                            <div className={isActive ? 'animate-pulse' : ''}>{navIcons[item.icon]}</div>
                            <span className="text-center text-[9px] font-medium leading-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
