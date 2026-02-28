'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Package, X, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
  };

  const handleZoomMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center rounded-xl">
        <Package className="h-20 w-20 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[current]}
            alt={`${productName} - Image ${current + 1}`}
            className="w-full h-full object-contain"
            draggable={false}
          />

          {/* Zoom button */}
          <button
            onClick={() => setZoomed(true)}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
          >
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === current ? 'bg-white shadow' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                  i === current ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center cursor-crosshair"
          onClick={() => setZoomed(false)}
          onMouseMove={handleZoomMove}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-10"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </>
          )}

          <div
            className="w-full h-full overflow-hidden"
            style={{
              backgroundImage: `url(${images[current]})`,
              backgroundSize: '200%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
