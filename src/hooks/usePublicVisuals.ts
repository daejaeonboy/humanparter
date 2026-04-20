import { useEffect, useState } from 'react';
import { getPublicBootstrapData, subscribePublicDataInvalidation } from '../api/publicDataApi';
import type { PublicVisualsContent } from '../content/publicVisualsContent';
import { usePrerenderData } from '../prerender/context';

export const usePublicVisuals = () => {
  const preloadedPublicVisuals = usePrerenderData()?.bootstrap?.publicVisuals;
  const [publicVisuals, setPublicVisuals] = useState<PublicVisualsContent | null>(preloadedPublicVisuals || null);

  useEffect(() => {
    let isMounted = true;

    const loadPublicVisuals = async () => {
      try {
        if (preloadedPublicVisuals && isMounted) {
          setPublicVisuals(preloadedPublicVisuals);
        }

        const bootstrapData = await getPublicBootstrapData();
        if (isMounted) {
          setPublicVisuals(bootstrapData.publicVisuals);
        }
      } catch (error) {
        console.error('Failed to load public visuals:', error);
      }
    };

    void loadPublicVisuals();
    const unsubscribe = subscribePublicDataInvalidation(() => {
      void loadPublicVisuals();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [preloadedPublicVisuals]);

  return publicVisuals;
};
