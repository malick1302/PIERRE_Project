import { useRef, useEffect, useState } from "react";

export default function Carousel({ videos, onSelectVideo, selectedVideo }) {
  const containerRef = useRef(null);
  const animationRef = useRef();
  const [items, setItems] = useState([]);
  const [centerVideo, setCenterVideo] = useState(null);

  const speedRef = useRef(0);
  const targetSpeed = useRef(0);

  const isAutoCentering = useRef(false);
  const targetItemRef = useRef(null);
  const centerPauseTimeout = useRef(null);

  const videoList = videos || [];

  const CARD_HEIGHT = 213;
  const VISIBLE_ITEMS_DESKTOP = 9;
  const VISIBLE_ITEMS_MOBILE = 3;

  const [dimensions, setDimensions] = useState({
    cardWidth: 100,
    gap: 60,
    sideWidth: 70,
    centerHeight: 154,
    sideHeight: 129,
    centerX: 152,
    sideX: 46
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calculateDimensions = () => {
      if (!containerRef.current) {
        requestAnimationFrame(calculateDimensions);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width || window.innerWidth;

      if (containerWidth === 0) {
        requestAnimationFrame(calculateDimensions);
        return;
      }

      const mobile = containerWidth < 768;
      setIsMobile(mobile);
      const visibleItems = mobile ? VISIBLE_ITEMS_MOBILE : VISIBLE_ITEMS_DESKTOP;

      if (mobile) {
        const figmaWidth = 390;
        const figmaCenterWidth = 86;
        const figmaCenterHeight = 154;
        const figmaSideWidth = 72;
        const figmaSideHeight = 129;
        const figmaGap = 34;
        const figmaCenterX = 152;
        const figmaSideX = 36;
        const scaleRatio = containerWidth / figmaWidth;

        const centerWidth = figmaCenterWidth * scaleRatio;
        const centerHeight = figmaCenterHeight * scaleRatio;
        const sideWidth = figmaSideWidth * scaleRatio;
        const sideHeight = figmaSideHeight * scaleRatio;
        const gap = figmaGap * scaleRatio;

        setDimensions({
          cardWidth: centerWidth,
          gap: gap,
          sideWidth: sideWidth,
          centerHeight: centerHeight,
          sideHeight: sideHeight,
          centerX: figmaCenterX * scaleRatio,
          sideX: figmaSideX * scaleRatio
        });
      } else {
        const figmaWidth = 1440;
        const figmaGap = 54;
        const scaleRatio = containerWidth / figmaWidth;
        
        const gapRatio = 0.6;
        const cardWidth = containerWidth / (visibleItems + (visibleItems - 1) * gapRatio);
        const gap = figmaGap * scaleRatio;
        
        setDimensions({ cardWidth, gap });
      }
    };

    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoList.length]);

  useEffect(() => {
    if (!videoList.length || dimensions.cardWidth === 0) return;

    if (isMobile) {
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;
      const scaleRatio = containerWidth / 390;

      const centerIndex = Math.floor(videoList.length / 2);
      const figmaCenterX = 152;
      const figmaSideX = 36;
      const figmaRightX = 273;

      const initialPositions = videoList.map((v, i) => {
        const offset = i - centerIndex;
        let x;

        if (offset === -1) {
          x = figmaSideX * scaleRatio;
        } else if (offset === 0) {
          x = figmaCenterX * scaleRatio;
        } else if (offset === 1) {
          x = figmaRightX * scaleRatio;
        } else {
          const baseX = figmaSideX * scaleRatio;
          x = baseX + (i - (centerIndex - 1)) * (dimensions.cardWidth + dimensions.gap);
        }

        return { ...v, x };
      });
      setItems(initialPositions);
    } else {
      const visibleItems = VISIBLE_ITEMS_DESKTOP;
      const totalVisibleWidth = visibleItems * dimensions.cardWidth + (visibleItems - 1) * dimensions.gap;
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;
      const startX = (containerWidth - totalVisibleWidth) / 2;

      const initialPositions = videoList.map((v, i) => ({
        ...v,
        x: startX + i * (dimensions.cardWidth + dimensions.gap),
      }));
      setItems(initialPositions);
    }
  }, [videos, dimensions, isMobile]);

  useEffect(() => {
    if (dimensions.cardWidth === 0) return;
    const totalWidth = (dimensions.cardWidth + dimensions.gap) * videoList.length;

    const loop = () => {
      if (!containerRef.current || items.length === 0 || totalWidth === 0) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isAutoCentering.current && targetItemRef.current) {
        const itemToCenter = targetItemRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        const center = rect.width / 2;

        setItems((prev) => {
          const currentItem = prev.find((v) => v.id === itemToCenter.id);
          if (!currentItem) return prev;

          let itemWidth = dimensions.cardWidth;
          if (isMobile) {
            const rect = containerRef.current.getBoundingClientRect();
            const containerWidth = rect.width;
            const scaleRatio = containerWidth / 390;
            const figmaCenterX = 152 * scaleRatio;
            const itemCenterX = currentItem.x + dimensions.cardWidth / 2;
            const distanceFromCenter = Math.abs(itemCenterX - figmaCenterX);
            if (distanceFromCenter < (dimensions.gap / 2)) {
              itemWidth = dimensions.cardWidth;
            } else {
              itemWidth = dimensions.sideWidth || dimensions.cardWidth * 0.7;
            }
          }
          let itemCenter = currentItem.x + itemWidth / 2;
          let distance = center - itemCenter;

          if (distance > totalWidth / 2) distance -= totalWidth;
          if (distance < -totalWidth / 2) distance += totalWidth;

          if (Math.abs(distance) < 0.5) {
            isAutoCentering.current = false;
            targetSpeed.current = 0;

            centerPauseTimeout.current = setTimeout(() => {
              targetItemRef.current = null;
            }, 500);

            return prev;
          }

          const speed = distance * 0.1;

          return prev.map((item) => {
            let newX = item.x + speed;
            if (newX < -dimensions.cardWidth - dimensions.gap) newX += totalWidth;
            if (newX > totalWidth - dimensions.cardWidth) newX -= totalWidth;
            return { ...item, x: newX };
          });
        });
      }

      if (!isAutoCentering.current && !targetItemRef.current) {
        speedRef.current += (targetSpeed.current - speedRef.current) * 0.08;

        if (Math.abs(speedRef.current) < 0.01) speedRef.current = 0;

        if (speedRef.current !== 0) {
          setItems((prev) =>
            prev.map((item) => {
              let newX = item.x - speedRef.current;

              if (newX < -dimensions.cardWidth - dimensions.gap) newX += totalWidth;
              if (newX > totalWidth - dimensions.cardWidth) newX -= totalWidth;

              return { ...item, x: newX };
            })
          );
        }
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (centerPauseTimeout.current) clearTimeout(centerPauseTimeout.current);
    };
  }, [videos, items.length, dimensions, isMobile]);

  const handleMouseMove = (e) => {
    if (isAutoCentering.current || targetItemRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const center = rect.width / 2;
    const distance = e.clientX - rect.left - center;
    const maxSpeed = 20;
    const deadZone = 50;

    if (Math.abs(distance) > deadZone) {
      const normalized = (Math.abs(distance) - deadZone) / (center - deadZone);
      const direction = Math.sign(distance);
      targetSpeed.current = direction * maxSpeed * normalized ** 2;
    } else {
      targetSpeed.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (!isAutoCentering.current && !targetItemRef.current) targetSpeed.current = 0;
  };

  const touchX = useRef(null);
  const lastTouchX = useRef(null);

  const handleTouchStart = (e) => {
    if (isAutoCentering.current || targetItemRef.current) return;
    touchX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isAutoCentering.current || targetItemRef.current) return;
    const delta = e.touches[0].clientX - lastTouchX.current;
    targetSpeed.current = -delta * 1.2;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isAutoCentering.current && !targetItemRef.current) targetSpeed.current = 0;
    touchX.current = null;
    lastTouchX.current = null;
  };

  const handleClick = (item) => {
    if (!containerRef.current || items.length === 0) return;

    if (centerPauseTimeout.current) clearTimeout(centerPauseTimeout.current);

    targetItemRef.current = item;
    isAutoCentering.current = true;

    onSelectVideo(item);
  };

  useEffect(() => {
    if (!containerRef.current || !items.length || dimensions.cardWidth === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const center = rect.width / 2;

    let closest = null;
    let minDist = Infinity;

    items.forEach((item) => {
      const itemCenter = item.x + dimensions.cardWidth / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < minDist) {
        minDist = distance;
        closest = item;
      }
    });

    setCenterVideo(closest);
  }, [items, dimensions]);

  return (
    <div className="w-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="relative bg-transparent cursor-pointer"
        style={{
          height: isMobile
            ? `${(dimensions.centerHeight || 154) + 50}px`
            : `${CARD_HEIGHT + 50}px`
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, i) => {
          const rect = containerRef.current?.getBoundingClientRect();
          const center = rect ? rect.width / 2 : 0;

          let scale, itemWidth, itemHeight, itemX;

          if (isMobile) {
            const containerWidth = rect ? rect.width : window.innerWidth;
            
            const centerWidth = dimensions.cardWidth;
            const centerHeight = dimensions.centerHeight || 154;
            const sideWidth = dimensions.sideWidth;
            const sideHeight = dimensions.sideHeight || 129;
            
            itemX = item.x;
            const itemCenter = item.x + centerWidth / 2;
            const distance = Math.abs(itemCenter - center);
            
            const maxDistance = (centerWidth + dimensions.gap) * 2;
            const scaleProgress = 1 - (distance / maxDistance);
            const clampedProgress = Math.max(0, Math.min(1, scaleProgress));
            
            itemWidth = sideWidth + (centerWidth - sideWidth) * clampedProgress;
            itemHeight = sideHeight + (centerHeight - sideHeight) * clampedProgress;
            
            scale = 1;
          } else {
            itemWidth = dimensions.cardWidth;
            itemHeight = CARD_HEIGHT;
            itemX = item.x;
            const itemCenter = item.x + dimensions.cardWidth / 2;
            const distance = Math.abs(itemCenter - center);
            const maxDistance = (dimensions.cardWidth + dimensions.gap) * 4;
            scale = 1 - (distance / maxDistance) * 0.3;
            scale = Math.max(0.7, Math.min(1, scale));
          }

          return (
            <div
              key={item.id + "-" + i}
              className="absolute transition-transform duration-100"
              style={{
                left: `${itemX}px`,
                width: `${itemWidth}px`,
                bottom: '0px',
                transform: `scale(${scale})`,
                transformOrigin: "bottom center",
                zIndex: Math.round(scale * 100),
                willChange: "transform, opacity",
              }}
            >
              <img
                src={item.thumbnail || item.url}
                alt={item.title || item.alt}
                onClick={() => handleClick(item)}
                className="w-full"
                style={{
                  height: `${itemHeight}px`,
                  objectFit: "cover",
                }}
              />
              {/* ✅ Marge bottom responsive sur les titres */}
              <div
                className="text-center font-HelveticaNeue text-base whitespace-nowrap mb-roar-y-mobile md:mb-roar-y-desktop"
                style={{
                  opacity: 1,
                  marginTop: isMobile ? '11px' : '8px',
                  marginLeft: isMobile ? '15px' : '0',
                  marginRight: isMobile ? '15px' : '0'
                }}
              >
                {item.title || item.alt || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}