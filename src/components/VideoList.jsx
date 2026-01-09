import { useEffect, useState, useRef } from "react";
import Carousel from "./Carousel";
import Player from "@vimeo/player";

// Dimensions de référence (comme Figma)
const BASE_WIDTH_MOBILE = 390;
const BASE_WIDTH_DESKTOP = 1440;

// Valeurs de référence en px (basées sur le design Figma)
const REFERENCE_VALUES = {
  mobile: {
    navbarSpacing: 41,
    videoSpacing: 80,
    horizontalMargin: 15, // 0.9375rem
    carouselBottomMargin: 40
  },
  desktop: {
    navbarSpacing: 17,
    videoSpacing: 25, // Espacement entre vidéo et carousel (augmenté pour tablette/desktop)
    horizontalMargin: 46, // 2.875rem
    navbarTopMargin: 18, // Marge top de la navbar (md:pt-[18px]) - utilisée pour carouselBottomMargin
    centerImageHeight: 210, // Hauteur de l'image centrale du carousel
    centerImageTotalHeight: 238, // Hauteur image (210px) + margin-top titre (8px) + hauteur titre (~20px)
    videoHeight: 403 // Hauteur du lecteur vidéo (modifiez cette valeur pour ajuster la taille de la vidéo)
  }
};

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // État pour la barre de progression
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // État pour les dimensions proportionnelles
  const [spacing, setSpacing] = useState({
    navbarSpacing: 41,
    videoSpacing: 80,
    horizontalMargin: 15,
    carouselBottomMargin: 40,
    videoHeight: 210 // Hauteur de l'image centrale du carousel (proportionnelle)
  });

  // Calcul des dimensions proportionnelles basées sur la largeur réelle du conteneur
  useEffect(() => {
    const calculateSpacing = () => {
      // Utiliser document.documentElement.clientWidth pour une mesure plus fiable
      const screenWidth = document.documentElement.clientWidth || window.innerWidth;
      const windowWidth = window.innerWidth;
      const containerWidth = containerRef.current ? containerRef.current.getBoundingClientRect().width : null;

      const isMobile = screenWidth < 768;

      const baseWidth = isMobile ? BASE_WIDTH_MOBILE : BASE_WIDTH_DESKTOP;
      const scaleRatio = screenWidth / baseWidth;
      const refValues = isMobile ? REFERENCE_VALUES.mobile : REFERENCE_VALUES.desktop;

      // Calculer la marge bottom du carousel = marge top de la navbar (toujours identique)
      // La navbar utilise md:pt-[18px] qui est fixe, donc on utilise aussi 18px fixe pour tablette/desktop
      // Pour mobile, on utilise la valeur proportionnelle
      const carouselBottomMargin = isMobile
        ? (refValues.carouselBottomMargin * scaleRatio)
        : 18; // 18px fixe pour correspondre à md:pt-[18px] de la navbar

      const newSpacing = {
        navbarSpacing: refValues.navbarSpacing * scaleRatio,
        videoSpacing: refValues.videoSpacing * scaleRatio,
        horizontalMargin: refValues.horizontalMargin * scaleRatio,
        carouselBottomMargin: carouselBottomMargin, // Toujours égal à la marge top de la navbar
        videoHeight: isMobile ? (154 * scaleRatio) : (refValues.videoHeight * scaleRatio) // Hauteur proportionnelle du lecteur vidéo
      };

      // Logs de débogage
      console.log('=== VideoList Spacing Calculation ===');
      console.log('screenWidth (clientWidth):', screenWidth);
      console.log('window.innerWidth:', windowWidth);
      console.log('containerRef width:', containerWidth);
      console.log('isMobile:', isMobile);
      console.log('baseWidth:', baseWidth);
      console.log('scaleRatio:', scaleRatio);
      console.log('refValues:', refValues);
      console.log('newSpacing:', newSpacing);
      console.log('Détails newSpacing:', {
        navbarSpacing: `${newSpacing.navbarSpacing.toFixed(2)}px`,
        videoSpacing: `${newSpacing.videoSpacing.toFixed(2)}px`,
        horizontalMargin: `${newSpacing.horizontalMargin.toFixed(2)}px`,
        carouselBottomMargin: `${newSpacing.carouselBottomMargin.toFixed(2)}px`
      });
      console.log('===================================');

      setSpacing(newSpacing);
    };

    // Calculer immédiatement et après le montage
    calculateSpacing();

    // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
    const rafId = requestAnimationFrame(() => {
      calculateSpacing();
    });

    window.addEventListener('resize', calculateSpacing);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateSpacing);
    };
  }, []);

  // Fetch videos from the server
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos.json");
        if (!response.ok) throw new Error("Failed to fetch videos.");
        const data = await response.json();

        const processedData = data.map((video) => {
          let videoUrl = video.url || video.video;
          if (videoUrl?.includes("vimeo.com/") && !videoUrl.includes("player.vimeo.com")) {
            const videoId = videoUrl.split("vimeo.com/")[1];
            videoUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          return { ...video, url: videoUrl };
        });

        setVideos(processedData);
        setSelectedVideo(processedData[0]);
      } catch (err) {
        console.error("Error loading videos:", err);
        setError(err.message);
      }
    };

    fetchVideos();
  }, []);

  // Initialize Vimeo Player when video changes
  useEffect(() => {
    if (videoRef.current && selectedVideo) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error destroying player:", err);
        }
      }

      setTimeout(() => {
        if (videoRef.current) {
          playerRef.current = new Player(videoRef.current);
          setIsPlaying(false);

          // Listen to timeupdate events for progress
          playerRef.current.on("timeupdate", async (data) => {
            try {
              const duration = await playerRef.current.getDuration();
              if (duration && duration > 0) {
                setProgress((data.seconds / duration) * 100);
              }
            } catch (err) {
              console.error("Error updating progress:", err);
            }
          });

          // Listen to play/pause events
          playerRef.current.on("play", () => setIsPlaying(true));
          playerRef.current.on("pause", () => setIsPlaying(false));
          playerRef.current.on("ended", () => setIsPlaying(false));
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error in cleanup:", err);
        }
        playerRef.current = null;
      }
    };
  }, [selectedVideo]);

  const handlePlayPause = async () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (err) {
      console.error("Error controlling video:", err);
    }
  };

  const handleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.requestFullscreen();
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  };

  // Log de l'état actuel du spacing avec détails
  console.log('VideoList render - current spacing state:', {
    navbarSpacing: `${spacing.navbarSpacing.toFixed(2)}px`,
    videoSpacing: `${spacing.videoSpacing.toFixed(2)}px`,
    horizontalMargin: `${spacing.horizontalMargin.toFixed(2)}px`,
    carouselBottomMargin: `${spacing.carouselBottomMargin.toFixed(2)}px`
  });

  return (
    <div ref={containerRef} className="w-full pb-8">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video - proportionnel */}
          <div
            style={{
              height: `${spacing.navbarSpacing}px`,
              backgroundColor: 'transparent' // Pour forcer l'application du style
            }}
            data-debug-spacing={spacing.navbarSpacing}
          />

          <div
            className="source-sans-light flex flex-col md:flex-row md:gap-6 md:items-start"
            style={{
              paddingLeft: `${spacing.horizontalMargin}px`,
              paddingRight: `${spacing.horizontalMargin}px`
            }}
            data-debug-margin={spacing.horizontalMargin}
          >
            {/* Player principal */}
            <div className="md:border-none relative" style={{ width: '100%', maxWidth: `${(spacing.videoHeight * 16) / 9}px` }}>
              {selectedVideo && selectedVideo.url ? (
                <>
                  <div
                    className="overflow-hidden roar-blue relative"
                    style={{
                      height: `${spacing.videoHeight}px`,
                      width: '100%',
                      maxWidth: `${(spacing.videoHeight * 16) / 9}px` // Limiter la largeur pour maintenir le ratio 16/9
                    }}
                  >
                    <iframe
                      ref={videoRef}
                      key={selectedVideo.id}
                      src={`${selectedVideo.url}?autoplay=0&loop=1&muted=0&controls=0`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={selectedVideo.title}
                    />
                  </div>
                  {/* Barre de progression */}
                  <div
                    className="relative w-full h-2 bg-gray-300 mb-3 cursor-pointer"
                    onClick={async (e) => {
                      if (playerRef.current) {
                        const rect = e.target.getBoundingClientRect();
                        const clickPosition = e.clientX - rect.left;

                        try {
                          const duration = await playerRef.current.getDuration();
                          if (duration && duration > 0) {
                            const newTime = (clickPosition / rect.width) * duration;
                            if (newTime >= 0 && newTime <= duration) {
                              playerRef.current.setCurrentTime(newTime);
                            }
                          }
                        } catch (err) {
                          console.error("Error setting time:", err);
                        }
                      }
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-white"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Play button */}
                  {!isPlaying && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-HelveticaNeue font-light text-[2rem] md:text-[3rem] text-white hover:scale-110 transition-transform z-10"
                    >
                      PLAY
                    </button>
                  )}

                  {/* Fullscreen button */}
                  <button
                    onClick={handleFullscreen}
                    className="absolute bottom-4 right-4 font-HelveticaNeue font-light text-[1.5rem] md:text-[2rem] text-white hover:scale-110 transition-transform z-10"
                  >
                    [+]
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-center h-[12.5rem] md:h-[30.1875rem] bg-gray-200">
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:w-[20.83vw] flex flex-col justify-start font-HelveticaNeue font-light mt-4 md:mt-0 md:ml-[1.125rem] md:mt-[1.125rem]">
              <h3 className="text-2xl md:text-[1.25rem] font-[500] ">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue md:text-[1.25rem] md:mb-[2.41375rem] md:mt-[0.75rem] font-style: italic">
                {selectedVideo?.soustitre}
              </p>
              <p className="text-sm font-HelveticaNeue font-[300] md:text-[1.25rem] ">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel - proportionnel */}
          <div
            style={{
              height: `${spacing.videoSpacing}px`,
              backgroundColor: 'transparent'
            }}
            data-debug-video-spacing={spacing.videoSpacing}
          />

          {/* Carrousel */}
          <div
            style={{
              paddingLeft: `${spacing.horizontalMargin}px`,
              paddingRight: `${spacing.horizontalMargin}px`,
              paddingTop: '0px',
              paddingBottom: `${spacing.carouselBottomMargin}px`
            }}
            data-debug-carousel-margin={spacing.horizontalMargin}
            data-debug-carousel-bottom={spacing.carouselBottomMargin}
          >
            <Carousel
              videos={videos}
              onSelectVideo={setSelectedVideo}
              selectedVideo={selectedVideo}
              carouselBottomMargin={spacing.carouselBottomMargin}
            />
          </div>
        </>
      )}
    </div>
  );
}