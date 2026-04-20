import React, { useEffect, useMemo, useState } from 'react';
import { DeliveryImageKind, getResponsiveImageSources } from '../../src/utils/imageDelivery';

type ResponsiveImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string;
  kind?: DeliveryImageKind;
  priority?: boolean;
  unoptimized?: boolean;
};

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  kind = 'card',
  priority = false,
  unoptimized = false,
  sizes,
  loading,
  decoding,
  fetchPriority,
  onError,
  ...rest
}) => {
  const [useOriginalSource, setUseOriginalSource] = useState(false);
  const sources = useMemo(
    () =>
      unoptimized || useOriginalSource
        ? {
            src,
            sizes: sizes || '100vw',
          }
        : getResponsiveImageSources(src, kind, sizes),
    [kind, sizes, src, unoptimized, useOriginalSource],
  );

  useEffect(() => {
    setUseOriginalSource(false);
  }, [src]);

  return (
    <img
      {...rest}
      src={sources.src}
      srcSet={sources.srcSet}
      sizes={sources.sizes}
      alt={alt}
      loading={loading || (priority ? 'eager' : 'lazy')}
      decoding={decoding || 'async'}
      fetchPriority={fetchPriority || (priority ? 'high' : 'auto')}
      onError={(event) => {
        if (!useOriginalSource && sources.src !== src) {
          setUseOriginalSource(true);
        }

        onError?.(event);
      }}
    />
  );
};
