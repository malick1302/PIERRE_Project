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

  const CARD_WIDTH = 100;
  const CARD_HEIGHT = 185;
  const GAP = 60;

  // Initialisation des positions (une seule fois)
  useEffect(() => {
    if (!videoList.length) return;
    const initialPositions = videoList.map((v, i) => ({
      ...v,
      x: i * (CARD_WIDTH + GAP),
    }));
    setItems(initialPositions);
  }, [videos]);

  // --- NOUVELLE BOUCLE PRINCIPALE (Gère défilement + centrage + pause) ---
  useEffect(() => {
    const totalWidth = (CARD_WIDTH + GAP) * videoList.length;

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
          let itemCenter = currentItem.x + CARD_WIDTH / 2;
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
            if (newX < -CARD_WIDTH - GAP) newX += totalWidth;
            if (newX > totalWidth - CARD_WIDTH) newX -= totalWidth;
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
                  if (newX < -CARD_WIDTH - GAP) newX += totalWidth;
                  if (newX > totalWidth - CARD_WIDTH) newX -= totalWidth;
      
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
  }, [videos, items.length]); 
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
    if (!containerRef.current || !items.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const center = rect.width / 2;

    let closest = null;
    let minDist = Infinity;

    items.forEach((item) => {
      const itemCenter = item.x + CARD_WIDTH / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < minDist) {
        minDist = distance;
        closest = item;
      }
    });

    setCenterVideo(closest);
  }, [items]);

  return (
    <div className="w-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-40 bg-transparent cursor-pointer md:mt-3 "
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, i) => {
          const rect = containerRef.current?.getBoundingClientRect();
          const center = rect ? rect.width / 2 : 0;
          const itemCenter = item.x + CARD_WIDTH / 2;
          const distance = Math.abs(itemCenter - center);

          const maxDistance = (CARD_WIDTH + GAP) * 4;
          let scale = 1 - (distance / maxDistance) * 0.3;
          scale = Math.max(0.7, Math.min(1, scale));

          return (
            <img
              key={item.id + "-" + i}
              src={item.thumbnail}
              alt={item.title}
              onClick={() => handleClick(item)}
              className="absolute transition-transform duration-100"
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                objectFit: "cover",
                left: `${item.x}px`,
                transform: `scale(${scale})`,
                transformOrigin: "bottom center",
                zIndex: Math.round(scale * 100),
                willChange: "transform, opacity",
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-center text-base  mt-8 font-HelveticaNeue">
        <h3 className="transition-opacity duration-300">
          {centerVideo?.title || ""}
        </h3>
      </div>
    </div>
  );
}