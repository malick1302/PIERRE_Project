import { useRef, useEffect, useState, useCallback } from "react";

export default function Carousel({ videos, onSelectVideo, selectedVideo }) {
  const containerRef = useRef(null);
  const animationRef = useRef();
  const [items, setItems] = useState([]);
  const [centerVideo, setCenterVideo] = useState(null);

  const speedRef = useRef(0);
  const targetSpeed = useRef(0);

  // Références clés pour la nouvelle logique
  const isAutoCentering = useRef(false);
  const targetItemRef = useRef(null); // L'élément à centrer
  const centerPauseTimeout = useRef(null);

  const videoList = videos || [];

  const CARD_HEIGHT = 240;
  const VISIBLE_ITEMS_DESKTOP = 9;
  const VISIBLE_ITEMS_MOBILE = 3;

  // Dimensions dynamiques calculées pour remplir la largeur
  const [dimensions, setDimensions] = useState({ cardWidth: 100, gap: 60, sideWidth: 70 });
  const [isMobile, setIsMobile] = useState(false);

  // Calcul des dimensions pour que les images remplissent exactement la largeur
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

      // Détecter si on est sur mobile (breakpoint md de Tailwind = 768px)
      const mobile = containerWidth < 768;
      setIsMobile(mobile);
      const visibleItems = mobile ? VISIBLE_ITEMS_MOBILE : VISIBLE_ITEMS_DESKTOP;

      if (mobile) {
        // Sur mobile : 3 images entièrement visibles et centrées
        // Basé sur Figma: image centrale 86px, gap ~35px
        // Calculer pour que les 3 images soient centrées et visibles
        const figmaWidth = 390;
        const figmaCenterWidth = 86;
        const figmaGap = 35;
        const scaleRatio = containerWidth / figmaWidth;

        const centerWidth = figmaCenterWidth * scaleRatio;
        const gap = figmaGap * scaleRatio;
        const sideWidth = centerWidth * 0.7; // Images extérieures 70% de la centrale

        // Largeur totale des 3 images avec gaps
        const totalWidth = sideWidth + gap + centerWidth + gap + sideWidth;

        // Si la largeur totale dépasse, ajuster proportionnellement
        if (totalWidth > containerWidth * 0.95) {
          const adjustRatio = (containerWidth * 0.95) / totalWidth;
          const adjustedCenterWidth = centerWidth * adjustRatio;
          const adjustedGap = gap * adjustRatio;
          setDimensions({ cardWidth: adjustedCenterWidth, gap: adjustedGap, sideWidth: adjustedCenterWidth * 0.7 });
        } else {
          setDimensions({ cardWidth: centerWidth, gap: gap, sideWidth: sideWidth });
        }
      } else {
        // Sur desktop : calcul original
        const gapRatio = 0.6;
        const cardWidth = containerWidth / (visibleItems + (visibleItems - 1) * gapRatio);
        const gap = cardWidth * gapRatio;
        setDimensions({ cardWidth, gap });
      }
    };

    calculateDimensions();

    // Recalculer lors du redimensionnement
    const handleResize = () => {
      calculateDimensions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoList.length]);

  // Initialisation des positions (une seule fois)
  useEffect(() => {
    if (!videoList.length || dimensions.cardWidth === 0) return;

    if (isMobile) {
      // Sur mobile : centrer les 3 images visibles
      const rect = containerRef.current?.getBoundingClientRect();
      const containerWidth = rect ? rect.width : window.innerWidth;

      const centerWidth = dimensions.cardWidth;
      const sideWidth = dimensions.sideWidth || centerWidth * 0.7;
      const gap = dimensions.gap;

      // Calculer la position pour centrer les 3 images
      // Image centrale au centre de l'écran
      const centerX = containerWidth / 2;
      const centerIndex = Math.floor(videoList.length / 2);

      const initialPositions = videoList.map((v, i) => {
        const offset = i - centerIndex;
        let x;

        if (offset === -1) {
          // Image gauche
          x = centerX - centerWidth / 2 - gap - sideWidth;
        } else if (offset === 0) {
          // Image centrale
          x = centerX - centerWidth / 2;
        } else if (offset === 1) {
          // Image droite
          x = centerX + centerWidth / 2 + gap;
        } else {
          // Autres images (hors vue)
          x = centerX - centerWidth / 2 + offset * (centerWidth + gap);
        }

        return { ...v, x };
      });
      setItems(initialPositions);
    } else {
      // Desktop : comportement original
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

  // --- NOUVELLE BOUCLE PRINCIPALE (Gère défilement + centrage + pause) ---
  useEffect(() => {
    if (dimensions.cardWidth === 0) return;
    const totalWidth = (dimensions.cardWidth + dimensions.gap) * videoList.length;

    const loop = () => {
      if (!containerRef.current || items.length === 0 || totalWidth === 0) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      let animationActive = false;

      // --- MODE 2 : AUTO-CENTRAGE (Priorité 1) ---
      if (isAutoCentering.current && targetItemRef.current) {
        const itemToCenter = targetItemRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        const center = rect.width / 2;

        setItems((prev) => {
          const currentItem = prev.find((v) => v.id === itemToCenter.id);
          if (!currentItem) return prev;

          // 1. Calcul de la distance du chemin le plus court
          let itemCenter = currentItem.x + dimensions.cardWidth / 2;
          let distance = center - itemCenter;

          if (distance > totalWidth / 2) distance -= totalWidth;
          if (distance < -totalWidth / 2) distance += totalWidth;

          // 2. Vérification de l'arrivée (moins de 0.5px du centre)
          if (Math.abs(distance) < 0.5) {
            // ARRIVÉ : Déclenchement de la pause
            isAutoCentering.current = false;
            targetSpeed.current = 0;

            // Pause 0.5 sec avant de libérer le carrousel
            centerPauseTimeout.current = setTimeout(() => {
              targetItemRef.current = null; // Libère le contrôle
            }, 500);

            return prev;
          }

          // 3. Mouvement progressif
          const speed = distance * 0.1;
          animationActive = true;

          return prev.map((item) => {
            let newX = item.x + speed;
            if (newX < -dimensions.cardWidth - dimensions.gap) newX += totalWidth;
            if (newX > totalWidth - dimensions.cardWidth) newX -= totalWidth;
            return { ...item, x: newX };
          });
        });
      }

      // --- MODE 1 : DÉFILEMENT (Priorité 2 - Uniquement si pas de cible ou cible libérée) ---
      if (!isAutoCentering.current && !targetItemRef.current) {

        speedRef.current += (targetSpeed.current - speedRef.current) * 0.08;

        if (Math.abs(speedRef.current) < 0.01) speedRef.current = 0;

        if (speedRef.current !== 0) {
          animationActive = true;
          setItems((prev) =>
            prev.map((item) => {
              let newX = item.x - speedRef.current;

              // Logique de wrapping (boucle infinie)
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
  // items.length dans les dépendances est un compromis pour s'assurer que le useEffect se ré-exécute si les données changent.

  // Mouse controls (Ajout de la condition pour ne pas bouger si centrage actif)
  const handleMouseMove = (e) => {
    if (isAutoCentering.current || targetItemRef.current) return; // Bloquer si centrage ou pause
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

  // Touch controls (Même blocage)
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
    targetSpeed.current = -delta * 0.4;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isAutoCentering.current && !targetItemRef.current) targetSpeed.current = 0;
    touchX.current = null;
    lastTouchX.current = null;
  };

  // Click → centrer l'image
  const handleClick = (item) => {
    if (!containerRef.current || items.length === 0) return;

    // Annuler la pause si elle est en cours (permet un re-centrage immédiat)
    if (centerPauseTimeout.current) clearTimeout(centerPauseTimeout.current);

    targetItemRef.current = item;
    isAutoCentering.current = true; // Déclenche le mode centrage dans le 'loop'

    onSelectVideo(item);
  };

  // Update center video (inchangé)
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
    <div className="w-full relative overflow-hidden md:mb-3 md:mt-1">
      <div
        ref={containerRef}
        className="relative bg-transparent cursor-pointer md:mt-3"
        style={{
          height: isMobile
            ? `${(dimensions.cardWidth * 2.8) + 60}px`
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
            // Sur mobile : 3 images, centrale plus grande
            const centerWidth = dimensions.cardWidth;
            const sideWidth = dimensions.sideWidth || centerWidth * 0.7;
            const gap = dimensions.gap;

            // Déterminer quelle image c'est par rapport au centre
            const itemCenter = item.x + centerWidth / 2;
            const distance = Math.abs(itemCenter - center);
            const isCenterImage = distance < gap;

            if (isCenterImage) {
              // Image centrale
              scale = 1;
              itemWidth = centerWidth;
              itemX = item.x;
              itemHeight = centerWidth * 2.8;
            } else {
              // Images extérieures
              scale = 0.7;
              itemWidth = sideWidth;
              itemHeight = sideWidth * 2.8;
              // Ajuster la position X pour que l'image réduite soit bien positionnée
              if (item.x < center) {
                // Image gauche
                itemX = item.x;
              } else {
                // Image droite
                itemX = item.x + (centerWidth - sideWidth);
              }
            }
          } else {
            // Desktop : comportement original
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
                bottom: 0,
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
              <div
                className="text-center mt-2 font-HelveticaNeue text-base whitespace-nowrap"
                style={{
                  opacity: 1,
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