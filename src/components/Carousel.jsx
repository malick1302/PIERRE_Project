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

  // Dimensions ajustées pour 9 images visibles
  const DIMENSIONS_DESKTOP = {
    center: { width: 120, height: 210 },
    adjacent: { width: 110, height: 200 },
    others: { width: 100, height: 180 }
  };
  const GAP_DESKTOP = 70;
  const TITLE_FONT_SIZE = 16;

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
      } else {
        // Desktop : calculer pour remplir exactement le conteneur
        // Largeur totale disponible
        const availableWidth = containerWidth;
        
        // On veut 9 images : 1 center + 2 adjacent + 6 others
        // Calcul de la largeur totale théorique
        const theoreticalTotalWidth = 
          DIMENSIONS_DESKTOP.center.width + 
          (2 * DIMENSIONS_DESKTOP.adjacent.width) + 
          (6 * DIMENSIONS_DESKTOP.others.width) + 
          (8 * GAP_DESKTOP); // 8 gaps entre 9 images
        
        // Ratio pour ajuster à la largeur disponible
        const scaleRatio = availableWidth / theoreticalTotalWidth;
        
        // Ajuster toutes les dimensions
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
        
        // Stocker les dimensions ajustées
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

  useEffect(() => {
    if (!videoList.length || dimensions.cardWidth === 0) return;

    if (isMobile) {
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;
      const scaleRatio = containerWidth / 390;

      const centerIndex = Math.floor(videoList.length / 2);
      const figmaCenterX = 152;
      const figmaSideX = 46;
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
      // Desktop : première image commence à x=0
      const startX = 0; // Pas de marge à gauche

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

            // Ne pas libérer automatiquement - rester centré
            // centerPauseTimeout.current = setTimeout(() => {
            //   targetItemRef.current = null;
            // }, 500);

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
    // Libérer le verrouillage dès qu'on bouge la souris (sauf pendant l'auto-centrage)
    if (!isAutoCentering.current && targetItemRef.current) {
      targetItemRef.current = null;
    }
    
    if (isAutoCentering.current) return; // Bloquer seulement pendant l'animation de centrage
    
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
    // Réinitialiser la vitesse quand la souris sort
    targetSpeed.current = 0;
  };

  const touchX = useRef(null);
  const lastTouchX = useRef(null);

  const handleTouchStart = (e) => {
    // Libérer le verrouillage dès qu'on touche (sauf pendant l'auto-centrage)
    if (!isAutoCentering.current && targetItemRef.current) {
      targetItemRef.current = null;
    }
    
    if (isAutoCentering.current) return; // Bloquer seulement pendant l'animation de centrage
    
    touchX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (isAutoCentering.current) return; // Bloquer seulement pendant l'animation de centrage
    
    const delta = e.touches[0].clientX - lastTouchX.current;
    targetSpeed.current = -delta * 1.2;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Réinitialiser la vitesse à la fin du touch
    targetSpeed.current = 0;
    touchX.current = null;
    lastTouchX.current = null;
  };

  const handleClick = (item) => {
    if (!containerRef.current || items.length === 0) return;

    // Annuler toute action en cours
    if (centerPauseTimeout.current) clearTimeout(centerPauseTimeout.current);

    // Libérer la cible précédente si on clique sur une nouvelle image
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
    <div className="w-full relative overflow-hidden md:mb-0 md:mt-0">
      <div
        ref={containerRef}
        className="relative bg-transparent cursor-pointer"
        style={{
          height: isMobile
            ? `${(dimensions.centerHeight || 154) + 50}px`
            : `${DIMENSIONS_DESKTOP.center.height + 50}px`
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

          let itemWidth, itemHeight, itemX;

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
          } else {
            // Desktop : calcul des dimensions selon la distance du centre
            itemX = item.x;
            const itemCenter = item.x + dimensions.cardWidth / 2;
            const distance = Math.abs(itemCenter - center);
            
            const zoneWidth = dimensions.cardWidth + dimensions.gap;
            
            // Utiliser les dimensions ajustées stockées
            const centerWidth = dimensions.centerWidth || DIMENSIONS_DESKTOP.center.width;
            const centerHeight = dimensions.centerHeight || DIMENSIONS_DESKTOP.center.height;
            const adjacentWidth = dimensions.adjacentWidth || DIMENSIONS_DESKTOP.adjacent.width;
            const adjacentHeight = dimensions.adjacentHeight || DIMENSIONS_DESKTOP.adjacent.height;
            const othersWidth = dimensions.cardWidth;
            const othersHeight = dimensions.othersHeight || DIMENSIONS_DESKTOP.others.height;
            
            // Smooth transition entre les 3 tailles
            if (distance < zoneWidth * 0.5) {
              // Zone centrale
              const progress = distance / (zoneWidth * 0.5);
              itemWidth = centerWidth - (centerWidth - adjacentWidth) * progress;
              itemHeight = centerHeight - (centerHeight - adjacentHeight) * progress;
            } else if (distance < zoneWidth * 1.5) {
              // Zone adjacente
              const progress = (distance - zoneWidth * 0.5) / zoneWidth;
              itemWidth = adjacentWidth - (adjacentWidth - othersWidth) * progress;
              itemHeight = adjacentHeight - (adjacentHeight - othersHeight) * progress;
            } else {
              // Zone éloignée - tous identiques
              itemWidth = othersWidth;
              itemHeight = othersHeight;
            }
          }

          return (
            <div
              key={item.id + "-" + i}
              className="absolute"
              style={{
                left: `${itemX}px`,
                width: `${itemWidth}px`,
                bottom: '0px',
                zIndex: 50,
                willChange: "transform, opacity",
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
                className="text-center font-HelveticaNeue whitespace-nowrap"
                style={{
                  opacity: 1,
                  marginTop: isMobile ? '11px' : '8px',
                  marginLeft: isMobile ? '15px' : '0',
                  marginRight: isMobile ? '15px' : '0',
                  fontSize: isMobile ? '12px' : `${TITLE_FONT_SIZE}px`
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