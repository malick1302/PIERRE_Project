import { useRef, useEffect, useState } from "react";

export default function Carousel({ videos, onSelectVideo, selectedVideo }) {
  const carouselRef = useRef(null);
  const itemRefs = useRef([]);
  const [centerX, setCenterX] = useState(0);
  const [scales, setScales] = useState([]);
  const [zIndexes, setZIndexes] = useState([]);
  const [offsetYs, setOffsetYs] = useState([]);
  const [rotates, setRotates] = useState([]);
  const [centerVideoIndex, setCenterVideoIndex] = useState(null);

  const mousePos = useRef(null);
  const animationRef = useRef();
  const currentSpeed = useRef(0);
  const isHovering = useRef(false);
  const isTouching = useRef(false);
  const touchStartX = useRef(null);
  const lastTouchX = useRef(null);
  const touchVelocity = useRef(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const freezeTimeoutRef = useRef(null);
  const isInitialized = useRef(false);

  const videoList = videos || [];
  const loopedVideos = [...videoList, ...videoList, ...videoList];

  // Fonction pour calculer la largeur exacte d'une section (responsive)
  const getSectionWidth = () => {
    if (videoList.length === 0 || itemRefs.current.length === 0 || !itemRefs.current[0]) {
      return 0;
    }

    let totalWidth = 0;
    // On calcule la largeur totale seulement pour la première boucle (index 0 à videoList.length - 1)
    for (let i = 0; i < videoList.length; i++) {
      const item = itemRefs.current[i];
      if (item) {
        // Ajoute la largeur de l'élément + la marge/gap (gap-2 = 8px)
        totalWidth += item.getBoundingClientRect().width + 8;
      }
    }
    // Retire le dernier gap
    if (totalWidth > 0) totalWidth -= 8; 
    
    return totalWidth;
  };

  // Calculer le centre du carousel
  useEffect(() => {
    const updateCenter = () => {
      if (!carouselRef.current) return;
      const rect = carouselRef.current.getBoundingClientRect();
      setCenterX(rect.left + rect.width / 2);
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  // Mettre à jour scale, zIndex, translateY et rotateY
  const updateStyles = () => {
    if (!carouselRef.current) return;
    const newScales = [];
    const newZ = [];
    const newY = [];
    const newRotates = [];
    let closestIndex = null;
    let minDistance = Infinity;

    itemRefs.current.forEach((el, idx) => {
      if (!el) {
        newScales.push(1);
        newZ.push(0);
        newY.push(0);
        newRotates.push(0);
        return;
      }
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = centerX - itemCenter;
      const maxDistance = 600;

      const scale = Math.max(0.6, 1 - (Math.abs(distance) / maxDistance) * 0.6);
      newScales.push(scale);

      newZ.push(Math.round(scale * 100));
      newY.push(-(scale - 1) * 10);

      const rotateY = Math.min(Math.abs(distance) / maxDistance, 1) * 5 * (distance < 0 ? 1 : -1);
      newRotates.push(rotateY);

      // Trouver l'image la plus proche du centre
      if (Math.abs(distance) < minDistance) {
        minDistance = Math.abs(distance);
        closestIndex = idx;
      }
    });

    setScales(newScales);
    setZIndexes(newZ);
    setOffsetYs(newY);
    setRotates(newRotates);
    setCenterVideoIndex(closestIndex);
  };

  useEffect(() => {
    updateStyles();
  }, [centerX, loopedVideos]);

  // Écouter le scroll pour mettre à jour en temps réel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      updateStyles();
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, [centerX]);

  // Système de scroll ultra-fluide (souris + tactile)
  useEffect(() => {
    const smoothScroll = () => {
      if (!carouselRef.current) {
        animationRef.current = requestAnimationFrame(smoothScroll);
        return;
      }

      let targetSpeed = 0;

      // Si le carrousel est figé, on ignore tout mouvement
      if (!isFrozen) {
        if (isHovering.current && mousePos.current !== null && !isTouching.current) {
          const { width } = carouselRef.current.getBoundingClientRect();
          const center = width / 2;
          const distance = mousePos.current - center;

          const deadZone = 30;
          if (Math.abs(distance) > deadZone) {
            const effectiveDistance = Math.abs(distance) - deadZone;
            const maxDistance = center - deadZone;
            const normalizedDistance = Math.min(effectiveDistance / maxDistance, 1);

            const minSpeed = 0.3;
            const maxSpeed = 35.5;

            const speed = minSpeed + (maxSpeed - minSpeed) * Math.pow(normalizedDistance, 2);
            targetSpeed = speed * Math.sign(distance);
          }
        } else if (isTouching.current === false && Math.abs(touchVelocity.current) > 0.1) {
          targetSpeed = touchVelocity.current;
          touchVelocity.current *= 0.95;
        }
      }

      const inertia = 0.08;
      currentSpeed.current += (targetSpeed - currentSpeed.current) * inertia;

      if (Math.abs(currentSpeed.current) < 0.01) {
        currentSpeed.current = 0;
      }
      
      const roundedSpeed = Math.round(currentSpeed.current * 100) / 100;

      if (Math.abs(roundedSpeed) > 0.01) {
        carouselRef.current.scrollLeft += roundedSpeed;

        const track = carouselRef.current;
        const scrollLeft = track.scrollLeft;
        
        // LOGIQUE INFINIE PRÉCISE
        const sectionWidth = getSectionWidth();
        
        if (sectionWidth > 0) {
            const centerSectionStart = sectionWidth;
            const centerSectionEnd = sectionWidth * 2;
            
            // Si on défile au-delà de la fin de la section centrale (vers la droite)
            if (scrollLeft >= centerSectionEnd) {
                // Utilisation du micro-timeout (10ms) pour masquer le saut
                setTimeout(() => {
                    if (track) track.scrollLeft = centerSectionStart;
                }, 10); 
            } 
            // Si on défile au-delà du début de la section centrale (vers la gauche)
            else if (scrollLeft <= 0) {
                 // Utilisation du micro-timeout (10ms) pour masquer le saut
                setTimeout(() => {
                    if (track) track.scrollLeft = centerSectionEnd;
                }, 10); 
            }
        }
      }

      animationRef.current = requestAnimationFrame(smoothScroll);
    };

    animationRef.current = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(animationRef.current);
  }, [getSectionWidth]);

  const handleMouseMove = (e) => {
    if (!isTouching.current) {
      const rect = carouselRef.current.getBoundingClientRect();
      mousePos.current = e.clientX - rect.left;
    }
  };

  const handleMouseEnter = () => {
    if (!isTouching.current) {
      isHovering.current = true;
    }
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    mousePos.current = null;
  };

  const handleTouchStart = (e) => {
    isTouching.current = true;
    isHovering.current = false;
    touchStartX.current = e.touches[0].clientX;
    lastTouchX.current = e.touches[0].clientX;
    touchVelocity.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isTouching.current || !lastTouchX.current) return;

    const currentTouchX = e.touches[0].clientX;
    const deltaX = lastTouchX.current - currentTouchX;

    if (carouselRef.current) {
      carouselRef.current.scrollLeft += deltaX;
    }

    touchVelocity.current = deltaX * 0.3;
    lastTouchX.current = currentTouchX;
  };

  const handleTouchEnd = () => {
    isTouching.current = false;
    touchStartX.current = null;
    lastTouchX.current = null;
  };

  // Initialisation : scroll au début de la section centrale
  useEffect(() => {
    if (carouselRef.current && videoList.length > 0 && !isInitialized.current) {
        const sectionWidth = getSectionWidth();
        if (sectionWidth > 0) {
            carouselRef.current.scrollLeft = sectionWidth;
            updateStyles();
            isInitialized.current = true;
        } else {
             setTimeout(() => {
                const calculatedWidth = getSectionWidth();
                if (calculatedWidth > 0 && carouselRef.current) {
                     carouselRef.current.scrollLeft = calculatedWidth;
                     updateStyles();
                     isInitialized.current = true;
                }
            }, 500);
        }
    }
  }, [videoList.length]);

  // Calculer le titre à afficher (récupérer la vraie vidéo avec modulo)
  const displayedTitle = centerVideoIndex !== null && videoList.length > 0
    ? loopedVideos[centerVideoIndex % videoList.length]?.title || ""
    : "";

  return (
    <div className="relative w-full mt-28 md:mt-4 overflow-hidden"> {/* OVERFLOW-HIDDEN ICI */}
      <div
        ref={carouselRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-12 px-8  md:py-2 pb-1"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          perspective: "1200px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          // On retire le will-change-transform sur l'élément principal
        }}
      >
        {loopedVideos.map((video, i) => (
          <div key={`${video.id}-${Math.floor(i / videoList.length)}-${i}`} className="relative flex-shrink-0">
            <img
              ref={(el) => (itemRefs.current[i] = el)}
              src={video.thumbnail}
              alt={video.title}
              onClick={() => onSelectVideo(video)}
              className={`w-30 h-48 object-cover cursor-pointer will-change-transform md:w-20 md:h-36 ${
                selectedVideo?.id === video.id ? "border-1 border-blue-500" : ""
              }`}
              style={{
                transform: `
                  scale(${scales[i] || 1}) 
                  translateY(${(1 - (scales[i] || 1)) * 100}px)
                  rotateY(${rotates[i] || 0}deg)
                  translateZ(${(scales[i] || 1) * 50 - 50}px)
                `,
                zIndex: zIndexes[i] || 0,
                transformStyle: "preserve-3d",
              }}
            />
          </div>
        ))}
      </div>

      {/* Titre fixe centré en dessous du carrousel */}
      <div className="w-full flex justify-center source-sans-light">
        <h3 
          key={displayedTitle}
          className=" text-lg transition-opacity duration-300"
        >
          {displayedTitle}
        </h3>
      </div>
    </div>
  );
}