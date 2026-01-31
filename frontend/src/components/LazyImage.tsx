import { useState, useEffect, useRef, type ImgHTMLAttributes } from 'react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  rootMargin?: string;
  threshold?: number;
}

export function LazyImage({
  src,
  alt,
  placeholderSrc,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
  onLoad,
  onError,
  ...imgProps
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder or blur effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-dark-800 animate-pulse" />
      )}
      
      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={hasError ? (placeholderSrc || 'https://via.placeholder.com/400x200?text=Image+Error') : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...imgProps}
        />
      )}
    </div>
  );
}

/**
 * Hook to track image loading state
 */
export function useImageLoader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const markLoaded = (src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  };

  const markFailed = (src: string) => {
    setFailedImages(prev => new Set(prev).add(src));
  };

  const isLoaded = (src: string) => loadedImages.has(src);
  const isFailed = (src: string) => failedImages.has(src);

  return { markLoaded, markFailed, isLoaded, isFailed };
}
