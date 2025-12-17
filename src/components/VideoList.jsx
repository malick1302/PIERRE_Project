import { useEffect, useState, useRef } from "react";
import Carousel from "./Carousel";
import Player from "@vimeo/player";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos.json");
        if (!response.ok) throw new Error("Failed to fetch videos.");
        const data = await response.json();

        // Process videos - convert vimeo.com URLs to player.vimeo.com format for iframes
        const processedData = data.map((video) => {
          let videoUrl = video.url || video.video;
          
          // Convert vimeo.com to player.vimeo.com for iframe embedding
          if (videoUrl?.includes('vimeo.com/') && !videoUrl.includes('player.vimeo.com')) {
            const videoId = videoUrl.split('vimeo.com/')[1];
            videoUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          
          return {
            ...video,
            url: videoUrl,
          };
        });

        console.log("Processed videos:", processedData);
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
      // Destroy previous player if exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error destroying player:", err);
        }
      }

      // Create new player after a small delay to ensure iframe is loaded
      setTimeout(() => {
        if (videoRef.current) {
          playerRef.current = new Player(videoRef.current);
          setIsPlaying(false);

          // Listen to play/pause events
          playerRef.current.on('play', () => setIsPlaying(true));
          playerRef.current.on('pause', () => setIsPlaying(false));
          playerRef.current.on('ended', () => setIsPlaying(false));
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

  return (
    <div className="min-h-screen">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video : Mobile 41px, Desktop 68px */}
          <div style={{ height: "41px" }} className="md:hidden" />
          <div style={{ height: "17px" }} className="hidden md:block" />

          <div className="source-sans-light flex flex-col md:flex-row md:gap-6 md:items-start px-[15px] md:px-[46px]">
            {/* Player principal - Same technique as Enter.jsx */}
            <div className="w-full md:w-[860px] md:border-none relative">
              {selectedVideo && selectedVideo.url ? (
                <>
                  <div
                    className="overflow-hidden roar-blue w-full md:w-[845px] relative"
                    style={{
                      height: "auto",
                      aspectRatio: "16/9",
                    }}
                  >
                    <iframe
                      ref={videoRef}
                      key={selectedVideo.id} // Force reload when video changes
                      src={`${selectedVideo.url}?autoplay=0&loop=0&muted=0&controls=0`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={selectedVideo.title}
                    />

                    {/* Play button in center - only show when not playing */}
                    {!isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-HelveticaNeue font-light text-[32px] md:text-[48px] text-white hover:scale-110 transition-transform z-10"
                      >
                        PLAY
                      </button>
                    )}

                    {/* Fullscreen button in bottom left */}
                    <button
                      onClick={handleFullscreen}
                      className="absolute bottom-4 right-4 font-HelveticaNeue font-light text-[24px] md:text-[32px] text-white hover:scale-110 transition-transform z-10"
                    >
                      [+]
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[200px] md:h-[483px] bg-gray-200">
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:w-[300px] flex flex-col justify-start font-HelveticaNeue font-light mt-4 md:mt-0 md:ml-[39.91px] md:mt-[19.81px]">
              <h3 className="text-2xl md:text-[20px] font-[500] ">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm  font-HelveticaNeue  md:text-[20px] md:mb-[38.62px] md:mt-[19.7px] font-style: italic">
                {selectedVideo?.soustitre}
              </p>
              <p className="text-sm font-HelveticaNeue md:text-[20px] ">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel : Mobile 180px (incluant titre/desc), Desktop 49px */}
          <div style={{ height: "80px" }} className="md:hidden" />
          <div style={{ height: "35.9px" }} className="hidden md:block" />

          {/* Carrousel - Avec les mêmes marges que VideoList */}
          <div className="px-[15px] md:px-[46px]">
            <Carousel
              videos={videos}
              onSelectVideo={setSelectedVideo}
              selectedVideo={selectedVideo}
            />
          </div>
        </>
      )}
    </div>
  );
}