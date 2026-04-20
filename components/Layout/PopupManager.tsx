import React, { useEffect, useState } from 'react';
import { Popup } from '../../src/api/cmsApi';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicHomeData } from '../../src/api/publicDataApi';
import { usePrerenderData } from '../../src/prerender/context';
import { ResponsiveImage } from '../ui/ResponsiveImage';

const getVisiblePopups = (items: Popup[]) => {
    const now = new Date();

    return items.filter((popup) => {
        if (!popup.is_active) return false;

        if (popup.start_date) {
            const start = new Date(popup.start_date);
            start.setHours(0, 0, 0, 0);
            if (now < start) return false;
        }

        if (popup.end_date) {
            const end = new Date(popup.end_date);
            end.setHours(23, 59, 59, 999);
            if (now > end) return false;
        }

        const hideDate = localStorage.getItem(`hide_popup_${popup.id}`);
        if (!hideDate) return true;

        return hideDate !== new Date().toDateString();
    });
};

export const PopupManager: React.FC = () => {
    const preloadedPopups = usePrerenderData()?.home?.popups as Popup[] | undefined;
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(!preloadedPopups);

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                if (preloadedPopups) {
                    setPopups(getVisiblePopups(preloadedPopups));
                    setLoading(false);
                }

                const { popups: nextPopups } = await getPublicHomeData();
                setPopups(getVisiblePopups(nextPopups as Popup[]));
            } catch (error) {
                console.error("Failed to load popups", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopups();
    }, [preloadedPopups]);

    const closePopup = (id: string, hideToday: boolean = false) => {
        if (hideToday) {
            localStorage.setItem(`hide_popup_${id}`, new Date().toDateString());
        }
        setPopups(prev => prev.filter(p => p.id !== id));
    };

    if (typeof window === 'undefined') return null;
    if (loading || popups.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center sm:block sm:inset-auto">
            {/* Mobile: Modal Style (One by one or stacked) */}
            {/* Desktop: Draggable or Fixed positions. For simplicity, we center them or stack them with slight offset */}

            {popups.map((popup, index) => (
                <div
                    key={popup.id}
                    className="pointer-events-auto fixed bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col border border-slate-200"
                    style={{
                        top: window.innerWidth > 640 ? '100px' : '50%',
                        left: window.innerWidth > 640 ? `${100 + (index * 20)}px` : '50%',
                        transform: window.innerWidth > 640 ? 'none' : 'translate(-50%, -50%)',
                        zIndex: 1000 + index,
                        maxWidth: '90vw',
                        width: '400px',
                        maxHeight: '80vh'
                    }}
                >
                    {/* Image / Content */}
                    <div className="relative flex-1 bg-slate-50 min-h-[200px] flex items-center justify-center">
                        {/* Link wrapper if link or target_product_code exists */}
                        {(popup.target_product_code || popup.link) ? (
                            popup.link && popup.link.startsWith('http') ? (
                                <a
                                    href={popup.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-full block"
                                    onClick={() => closePopup(popup.id!)}
                                >
                                    <ResponsiveImage
                                        src={popup.image_url || 'https://via.placeholder.com/400x400?text=Popup'}
                                        alt={popup.title}
                                        kind="popup"
                                        priority={index === 0}
                                        sizes="(min-width: 640px) 400px, 90vw"
                                        className="w-full h-auto object-contain"
                                    />
                                </a>
                            ) : (
                                <Link
                                    to={popup.target_product_code ? `/p/${popup.target_product_code}` : (popup.link || '/')}
                                    className='w-full h-full block'
                                    onClick={() => closePopup(popup.id!)}
                                >
                                    <ResponsiveImage
                                        src={popup.image_url || 'https://via.placeholder.com/400x400?text=Popup'}
                                        alt={popup.title}
                                        kind="popup"
                                        priority={index === 0}
                                        sizes="(min-width: 640px) 400px, 90vw"
                                        className="w-full h-auto object-contain"
                                    />
                                </Link>
                            )
                        ) : (
                            <ResponsiveImage
                                src={popup.image_url || 'https://via.placeholder.com/400x400?text=Popup'}
                                alt={popup.title}
                                kind="popup"
                                priority={index === 0}
                                sizes="(min-width: 640px) 400px, 90vw"
                                className="w-full h-auto object-contain"
                            />
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-900 text-white p-3 flex justify-between items-center text-sm">
                        <button
                            onClick={() => closePopup(popup.id!, true)}
                            className="text-slate-300 hover:text-white transition-colors text-xs"
                        >
                            오늘 하루 보지 않기
                        </button>
                        <button
                            onClick={() => closePopup(popup.id!)}
                            className="font-bold flex items-center gap-1 hover:text-slate-300 transition-colors"
                        >
                            닫기 <X size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
