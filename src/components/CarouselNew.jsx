import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export default function CarouselNew({ videos, onSelectVideo, selectedVideo, carouselBottomMargin = 60 }) {
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const [items, setItems] = useState([]);
  const [centerVideo, setCenterVideo] = useState(null);

  const speedRef = useRef(0);
  const targetSpeed = useRef(0);
  const currentX = useRef(0);

  const isAutoCentering = useRef(false);
  const targetItemRef = useRef(null);
  const centerPauseTimeout = useRef(null);

  const videoList = videos || [];

  // Dimensions ajustées pour 9 images visibles
  const DIMENSIONS_DESKTOP = {
    center: { width: 120, height: 210 },
    adjacent: { width: 110, height: 200 },
    others: { width: 100, height: 180 }
  };
  const GAP_DESKTOP = 70;
  const TITLE_FONT_SIZE = 16;

  const VISIBLE_ITEMS_DESKTOP = 9;
  const VISIBLE_ITEMS_TABLET = 5;
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
  const [isTablet, setIsTablet] = useState(false);

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
      const tablet = containerWidth >= 768 && containerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile) {
        const figmaWidth = 390;
        const figmaCenterWidth = 86;
        const figmaCenterHeight = 154;
        const figmaSideWidth = 72;
        const figmaSideHeight = 129;
        const figmaGap = 34;
        const figmaCenterX = 152;
        const figmaSideX = 46;
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
      } else if (tablet) {
        const availableWidth = containerWidth;
        const theoreticalTotalWidth =
          DIMENSIONS_DESKTOP.center.width +
          (4 * DIMENSIONS_DESKTOP.others.width) +
          (4 * GAP_DESKTOP);

        const scaleRatio = availableWidth / theoreticalTotalWidth;

        const adjustedDimensions = {
          center: {
            width: DIMENSIONS_DESKTOP.center.width * scaleRatio,
            height: DIMENSIONS_DESKTOP.center.height * scaleRatio
          },
          others: {
            width: DIMENSIONS_DESKTOP.others.width * scaleRatio,
            height: DIMENSIONS_DESKTOP.others.height * scaleRatio
          }
        };

        const adjustedGap = GAP_DESKTOP * scaleRatio;

        setDimensions({
          cardWidth: adjustedDimensions.others.width,
          gap: adjustedGap,
          centerWidth: adjustedDimensions.center.width,
          centerHeight: adjustedDimensions.center.height,
          othersHeight: adjustedDimensions.others.height
        });
      } else {
        const availableWidth = containerWidth;
        const theoreticalTotalWidth =
          DIMENSIONS_DESKTOP.center.width +
          (2 * DIMENSIONS_DESKTOP.adjacent.width) +
          (6 * DIMENSIONS_DESKTOP.others.width) +
          (8 * GAP_DESKTOP);

        const scaleRatio = availableWidth / theoreticalTotalWidth;

        const adjustedDimensions = {
          center: {
            width: DIMENSIONS_DESKTOP.center.width * scaleRatio,
            height: DIMENSIONS_DESKTOP.center.height
          },
          adjacent: {
            width: DIMENSIONS_DESKTOP.adjacent.width * scaleRatio,
            height: DIMENSIONS_DESKTOP.adjacent.height
          },
          others: {
            width: DIMENSIONS_DESKTOP.others.width * scaleRatio,
            height: DIMENSIONS_DESKTOP.others.height
          }
        };

        const adjustedGap = GAP_DESKTOP * scaleRatio;

        setDimensions({
          cardWidth: adjustedDimensions.others.width,
          gap: adjustedGap,
          centerWidth: adjustedDimensions.center.width,
          adjacentWidth: adjustedDimensions.adjacent.width,
          centerHeight: adjustedDimensions.center.height,
          adjacentHeight: adjustedDimensions.adjacent.height,
          othersHeight: adjustedDimensions.others.height
        });
      }
    };

    calculateDimensions();
    const handleResize = () => {
      calculateDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoList.length]);

  // Initialiser les items avec duplication pour l'effet infini
  useEffect(() => {
    if (!videoList.length) {
      setItems([]);
      return;
    }

    // Attendre que les dimensions soient calculées
    if (dimensions.cardWidth === 0) {
      return;
    }

    console.log('CarouselNew: Initializing items', { videoListLength: videoList.length, cardWidth: dimensions.cardWidth, isMobile, isTablet });

    // Dupliquer les items pour créer l'effet infini (comme dans le CodePen)
    const duplicatedItems = [...videoList, ...videoList, ...videoList];
    const singleSetWidth = videoList.length * (dimensions.cardWidth + dimensions.gap);
    
    if (isMobile) {
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;
      const scaleRatio = containerWidth / 390;

      const centerIndex = Math.floor(videoList.length / 2);
      const figmaCenterX = 152;
      const figmaSideX = 46;
      const figmaRightX = 273;

      const initialPositions = duplicatedItems.map((v, i) => {
        const originalIndex = i % videoList.length;
        const setIndex = Math.floor(i / videoList.length);
        const offset = originalIndex - centerIndex;
        let baseX;

        if (offset === -1) {
          baseX = figmaSideX * scaleRatio;
        } else if (offset === 0) {
          baseX = figmaCenterX * scaleRatio;
        } else if (offset === 1) {
          baseX = figmaRightX * scaleRatio;
        } else {
          baseX = figmaSideX * scaleRatio + (originalIndex - (centerIndex - 1)) * (dimensions.cardWidth + dimensions.gap);
        }

        const x = baseX + (setIndex * singleSetWidth);
        return { ...v, x, originalIndex, duplicateIndex: i };
      });
      setItems(initialPositions);
    } else if (isTablet) {
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;
      const centerIndex = 2;
      const centerWidth = dimensions.centerWidth || dimensions.cardWidth;
      const othersWidth = dimensions.cardWidth;
      const gap = dimensions.gap;

      const totalWidth = (2 * othersWidth) + centerWidth + (2 * othersWidth) + (4 * gap);
      const startX = (containerWidth - totalWidth) / 2;

      const initialPositions = duplicatedItems.map((v, i) => {
        const originalIndex = i % videoList.length;
        const setIndex = Math.floor(i / videoList.length);
        let baseX;

        if (originalIndex < centerIndex) {
          baseX = startX + originalIndex * (othersWidth + gap);
        } else if (originalIndex === centerIndex) {
          baseX = startX + (2 * (othersWidth + gap));
        } else {
          baseX = startX + (2 * (othersWidth + gap)) + centerWidth + gap + ((originalIndex - centerIndex - 1) * (othersWidth + gap));
        }

        const x = baseX + (setIndex * singleSetWidth);
        return { ...v, x, originalIndex, duplicateIndex: i };
      });
      setItems(initialPositions);
    } else {
      const startX = 0;

      const initialPositions = duplicatedItems.map((v, i) => {
        const originalIndex = i % videoList.length;
        const setIndex = Math.floor(i / videoList.length);
        const baseX = startX + originalIndex * (dimensions.cardWidth + dimensions.gap);
        const x = baseX + (setIndex * singleSetWidth);
        return { ...v, x, originalIndex, duplicateIndex: i };
      });
      setItems(initialPositions);
      console.log('CarouselNew: Items initialized', { count: initialPositions.length });
    }
  }, [videos, dimensions, isMobile, isTablet, videoList.length]);

  // Animation GSAP pour le défilement infini
  useEffect(() => {
    if (!carouselRef.current || items.length === 0 || dimensions.cardWidth === 0) return;

    const totalWidth = videoList.length * (dimensions.cardWidth + dimensions.gap);
    
    // Tuer toute animation précédente
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Fonction d'animation
    const animate = () => {
      if (!carouselRef.current) return;

      // Appliquer la vitesse
      speedRef.current += (targetSpeed.current - speedRef.current) * 0.08;
      if (Math.abs(speedRef.current) < 0.01) speedRef.current = 0;

      if (speedRef.current !== 0 || isAutoCentering.current) {
        currentX.current -= speedRef.current;

        // Wrapping infini (comme dans le CodePen)
        if (currentX.current <= -totalWidth) {
          currentX.current += totalWidth;
        } else if (currentX.current >= 0) {
          currentX.current -= totalWidth;
        }

        // Appliquer la transformation avec GSAP
        gsap.set(carouselRef.current, {
          x: currentX.current
        });
      }

      // Auto-centering
      if (isAutoCentering.current && targetItemRef.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const center = rect.width / 2;
        
        // Trouver l'item cible dans les items actuels
        const targetItem = items.find(item => item.id === targetItemRef.current.id);
        if (!targetItem) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // Calculer la position réelle de l'item (avec le décalage GSAP)
        const itemRealX = targetItem.x + currentX.current;
        
        let itemWidth = dimensions.cardWidth;
        if (isMobile) {
          const containerWidth = rect.width;
          const scaleRatio = containerWidth / 390;
          const figmaCenterX = 152 * scaleRatio;
          const itemCenterX = itemRealX + dimensions.cardWidth / 2;
          const distanceFromCenter = Math.abs(itemCenterX - figmaCenterX);
          if (distanceFromCenter < (dimensions.gap / 2)) {
            itemWidth = dimensions.cardWidth;
          } else {
            itemWidth = dimensions.sideWidth || dimensions.cardWidth * 0.7;
          }
        }

        const itemCenter = itemRealX + itemWidth / 2;
        let distance = center - itemCenter;

        if (Math.abs(distance) < 0.5) {
          isAutoCentering.current = false;
          targetSpeed.current = 0;
          speedRef.current = 0;
        } else {
          targetSpeed.current = distance * 0.1;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (centerPauseTimeout.current) {
        clearTimeout(centerPauseTimeout.current);
      }
    };
  }, [videos, items, dimensions, isMobile, isTablet, videoList.length]);

  const handleMouseMove = (e) => {
    if (!isAutoCentering.current && targetItemRef.current) {
      targetItemRef.current = null;
    }

    if (isAutoCentering.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

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
    targetSpeed.current = 0;
  };

  const touchX = useRef(null);
  const lastTouchX = useRef(null);

  const handleTouchStart = (e) => {
    if (!isAutoCentering.current && targetItemRef.current) {
      targetItemRef.current = null;
    }

    if (isAutoCentering.current) return;

    touchX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isAutoCentering.current) return;

    const delta = e.touches[0].clientX - lastTouchX.current;
    targetSpeed.current = -delta * 1.2;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    targetSpeed.current = 0;
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
      // Prendre en compte le décalage GSAP
      const itemRealX = item.x + currentX.current;
      const itemCenter = itemRealX + dimensions.cardWidth / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < minDist) {
        minDist = distance;
        closest = item;
      }
    });

    setCenterVideo(closest);
  }, [items, dimensions]);

  console.log('CarouselNew: Render', { itemsCount: items.length, dimensions, isMobile, isTablet });

  return (
    <div className="w-full relative overflow-hidden md:mb-0 md:mt-0">
      <div
        ref={containerRef}
        className="relative bg-transparent cursor-pointer"
        style={{
          height: isMobile
            ? `${(dimensions.centerHeight || 154) + 60}px`
            : `${DIMENSIONS_DESKTOP.center.height + 8 + 20}px`
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={carouselRef}
          className="relative"
          style={{
            willChange: 'transform',
            width: '100%',
            height: '100%'
          }}
        >
          {items.length > 0 ? items.map((item, i) => {
            const rect = containerRef.current?.getBoundingClientRect();
            const center = rect ? rect.width / 2 : 0;

            let itemWidth, itemHeight, itemX;

            // Prendre en compte le décalage GSAP pour le calcul des positions
            const itemRealX = item.x + currentX.current;

            if (isMobile) {
              const containerWidth = rect ? rect.width : window.innerWidth;
              const centerWidth = dimensions.cardWidth;
              const centerHeight = dimensions.centerHeight || 154;
              const sideWidth = dimensions.sideWidth;
              const sideHeight = dimensions.sideHeight || 129;

              itemX = item.x;
              const itemCenter = itemRealX + centerWidth / 2;
              const distance = Math.abs(itemCenter - center);

              const maxDistance = (centerWidth + dimensions.gap) * 2;
              const scaleProgress = 1 - (distance / maxDistance);
              const clampedProgress = Math.max(0, Math.min(1, scaleProgress));

              itemWidth = sideWidth + (centerWidth - sideWidth) * clampedProgress;
              itemHeight = sideHeight + (centerHeight - sideHeight) * clampedProgress;
            } else if (isTablet) {
              itemX = item.x;
              const centerIndex = 2;

              if (item.originalIndex === centerIndex) {
                itemWidth = dimensions.centerWidth || dimensions.cardWidth;
                itemHeight = dimensions.centerHeight || DIMENSIONS_DESKTOP.center.height;
              } else {
                itemWidth = dimensions.cardWidth;
                itemHeight = dimensions.othersHeight || DIMENSIONS_DESKTOP.others.height;
              }
            } else {
              itemX = item.x;
              const itemCenter = itemRealX + dimensions.cardWidth / 2;
              const distance = Math.abs(itemCenter - center);

              const zoneWidth = dimensions.cardWidth + dimensions.gap;

              const centerWidth = dimensions.centerWidth || DIMENSIONS_DESKTOP.center.width;
              const centerHeight = dimensions.centerHeight || DIMENSIONS_DESKTOP.center.height;
              const adjacentWidth = dimensions.adjacentWidth || DIMENSIONS_DESKTOP.adjacent.width;
              const adjacentHeight = dimensions.adjacentHeight || DIMENSIONS_DESKTOP.adjacent.height;
              const othersWidth = dimensions.cardWidth;
              const othersHeight = dimensions.othersHeight || DIMENSIONS_DESKTOP.others.height;

              if (distance < zoneWidth * 0.5) {
                const progress = distance / (zoneWidth * 0.5);
                itemWidth = centerWidth - (centerWidth - adjacentWidth) * progress;
                itemHeight = centerHeight - (centerHeight - adjacentHeight) * progress;
              } else if (distance < zoneWidth * 1.5) {
                const progress = (distance - zoneWidth * 0.5) / zoneWidth;
                itemWidth = adjacentWidth - (adjacentWidth - othersWidth) * progress;
                itemHeight = adjacentHeight - (adjacentHeight - othersHeight) * progress;
              } else {
                itemWidth = othersWidth;
                itemHeight = othersHeight;
              }
            }

            return (
              <div
                key={item.id + "-" + item.duplicateIndex}
                className="absolute"
                style={{
                  left: `${itemX}px`,
                  width: `${itemWidth}px`,
                  bottom: "0px",
                  zIndex: 50,
                  willChange: "transform, opacity",
                  pointerEvents: "auto"
                }}
              >
                <img
                  src={item.thumbnail || item.url}
                  alt={item.title || item.alt}
                  onClick={() => handleClick(item)}
                  className="w-full cursor-pointer"
                  style={{
                    height: `${itemHeight}px`,
                    objectFit: "cover",
                  }}
                />
                <div
                  className="text-center font-HelveticaNeue font-light whitespace-nowrap pt-2"
                  style={{
                    opacity: 1,
                    marginTop: isMobile ? "11px" : "8px",
                    marginLeft: isMobile ? "15px" : "0",
                    marginRight: isMobile ? "15px" : "0",
                    fontSize: isMobile ? "12px" : `${TITLE_FONT_SIZE}px`,
                  }}
                >
                  {item.title || item.alt || ""}
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-gray-500 p-4">
              Loading carousel...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

