import { useEffect, useRef, useState } from "react";

export default function Carousel({ videos, onSelectVideo, selectedVideo }) {
  const containerRef = useRef(null);
  const animationRef = useRef();

  const [items, setItems] = useState([]);
  const [centerVideo, setCenterVideo] = useState(null);

  const speedRef = useRef(0);
  const targetSpeed = useRef(0);
  const touchX = useRef(null);
  const lastTouchX = useRef(null);

  const videoList = videos || [];

  // ⚙️ Configuration — plus petites images
  const CARD_WIDTH = 140;
  const CARD_HEIGHT = 210;
  const GAP = 15;

  // 🌅 Initialisation des positions
  useEffect(() => {
    if (videoList.length === 0) return;

    const initialPositions = videoList.map((video, i) => ({
      ...video,
      x: i * (CARD_WIDTH + GAP),
    }));

    setItems(initialPositions);
  }, [videos]);

  // 🎮 Animation fluide
  useEffect(() => {
    const loop = () => {
      if (!containerRef.current || items.length === 0) {
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // vitesse lissée
      speedRef.current += (targetSpeed.current - speedRef.current) * 0.08;

      // déplacement virtuel fluide
      setItems((prev) =>
        prev.map((item) => {
          const newX = item.x - speedRef.current;
          const totalWidth = (CARD_WIDTH + GAP) * videoList.length;

          // boucle infinie
          let wrappedX = newX;
          if (wrappedX < -CARD_WIDTH - GAP) wrappedX += totalWidth;
          if (wrappedX > totalWidth - CARD_WIDTH) wrappedX -= totalWidth;

          return { ...item, x: wrappedX };
        })
      );

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [items, videos]);

  // 🖱️ Contrôle souris
  const handleMouseMove = (e) => {
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
    targetSpeed.current = 0;
  };

  // 🤏 Contrôle tactile
  const handleTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const current = e.touches[0].clientX;
    const delta = current - lastTouchX.current;
    targetSpeed.current = -delta * 0.4;
    lastTouchX.current = current;
  };

  const handleTouchEnd = () => {
    targetSpeed.current = 0;
    touchX.current = null;
    lastTouchX.current = null;
  };

  // 🧠 Trouver la vidéo la plus proche du centre
  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const center = rect.width / 2;

    let minDistance = Infinity;
    let closest = null;

    items.forEach((item) => {
      const itemCenter = item.x + CARD_WIDTH / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < minDistance) {
        minDistance = distance;
        closest = item;
      }
    });

    setCenterVideo(closest);
  }, [items]);

  return (
    <div className="w-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="relative h-48 bg-transparent cursor-pointer"
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
          
          // Échelle progressive et fluide basée sur la distance
          const maxDistance = (CARD_WIDTH + GAP) * 4; // Distance pour atteindre la taille minimale
          let scale = 1.0 - (distance / maxDistance) * 0.5; // De 1.0 à 0.5
          scale = Math.max(0.5, Math.min(1.0, scale)); // Limiter entre 0.5 et 1.0

          return (
            <img
              key={item.id + "-" + i}
              src={item.thumbnail}
              alt={item.title}
              onClick={() => onSelectVideo(item)}
              className={`absolute bottom-0 transition-transform duration-100 ${
                selectedVideo?.id === item.id ? "" : ""
              }`}
              style={{
                width: `${CARD_WIDTH}px`,
                height: `${CARD_HEIGHT}px`,
                objectFit: "cover",
                left: `${item.x}px`,
                transform: `scale(${scale})`,
                transformOrigin: "bottom center",
                zIndex: Math.round(scale * 100),
                willChange: "transform, opacity",
                transition: "opacity 0.1s ease-out",
              }}
            />
          );
        })}
      </div>

      <div className="flex justify-center  text-base">
        <h3 className="transition-opacity duration-300">
          {centerVideo?.title || ""}
        </h3>
      </div>
    </div>
  );
}