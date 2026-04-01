import React, { useMemo } from 'react';
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
  ...rest
}) => {
  const sources = useMemo(
    () =>
      unoptimized
        ? {
            src,
            sizes: sizes || '100vw',
          }
        : getResponsiveImageSources(src, kind, sizes),
    [kind, sizes, src, unoptimized],
  );

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
    />
  );
};
