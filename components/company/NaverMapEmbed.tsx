import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

declare global {
  interface Window {
    naver?: {
      maps?: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
        Point: new (x: number, y: number) => unknown;
        Size: new (width: number, height: number) => unknown;
        Position: {
          TOP_RIGHT: unknown;
        };
        Service?: {
          Status?: {
            OK: string;
          };
          geocode: (
            options: { query: string },
            callback: (status: string, response: { v2?: { addresses?: Array<{ x: string; y: string }> } }) => void,
          ) => void;
        };
      };
    };
  }
}

interface NaverMapEmbedProps {
  address: string;
  title: string;
  naverMapUrl: string;
}

let naverMapScriptPromise: Promise<void> | null = null;

const loadNaverMapScript = (clientId: string) => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.naver?.maps) {
    return Promise.resolve();
  }

  if (naverMapScriptPromise) {
    return naverMapScriptPromise;
  }

  naverMapScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-naver-map-script="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('네이버 지도 스크립트 로드에 실패했습니다.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&submodules=geocoder`;
    script.async = true;
    script.defer = true;
    script.dataset.naverMapScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('네이버 지도 스크립트 로드에 실패했습니다.'));
    document.head.appendChild(script);
  });

  return naverMapScriptPromise;
};

export const NaverMapEmbed: React.FC<NaverMapEmbedProps> = ({
  address,
  title,
  naverMapUrl,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const clientId = useMemo(() => (import.meta.env.VITE_NAVER_MAP_CLIENT_ID || '').trim(), []);

  useEffect(() => {
    if (!clientId || typeof window === 'undefined') {
      setStatus('fallback');
      return;
    }

    let disposed = false;

    const initializeMap = async () => {
      try {
        await loadNaverMapScript(clientId);

        if (disposed || !mapRef.current || !window.naver?.maps) {
          return;
        }

        const { maps } = window.naver;
        const service = maps.Service;
        if (!service?.geocode) {
          setStatus('fallback');
          return;
        }

        service.geocode({ query: address }, (geocodeStatus, response) => {
          if (disposed || !mapRef.current || !window.naver?.maps) return;

          const firstAddress = response.v2?.addresses?.[0];
          const successStatus = window.naver?.maps?.Service?.Status?.OK || 'OK';
          if (geocodeStatus !== successStatus || !firstAddress) {
            setStatus('fallback');
            return;
          }

          const position = new maps.LatLng(Number(firstAddress.y), Number(firstAddress.x));
          const map = new maps.Map(mapRef.current, {
            center: position,
            zoom: 17,
            zoomControl: true,
            zoomControlOptions: {
              position: maps.Position.TOP_RIGHT,
            },
            mapDataControl: false,
            scaleControl: false,
            logoControl: false,
            mapTypeControl: false,
          });

          new maps.Marker({
            position,
            map,
            title,
          });

          setStatus('ready');
        });
      } catch (error) {
        console.error('Failed to initialize Naver map:', error);
        if (!disposed) {
          setStatus('fallback');
        }
      }
    };

    void initializeMap();

    return () => {
      disposed = true;
    };
  }, [address, clientId, title]);

  if (status === 'fallback') {
    return (
      <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
        <iframe
          src={naverMapUrl}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '540px' }}
          allowFullScreen
          loading="lazy"
          title={`${title} 위치 지도`}
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <Loader2 size={16} className="animate-spin text-[#001e45]" />
            네이버 지도를 불러오는 중입니다
          </div>
        </div>
      )}

      <div ref={mapRef} className="min-h-[540px] w-full bg-slate-100" />

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#001e45]/72">
          <MapPin size={14} />
          Naver Map
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-800">{address}</p>
      </div>
    </div>
  );
};
