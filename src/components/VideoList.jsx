import { useEffect, useState } from "react";
import Carousel from "./Carousel";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/videos.json");
        if (!response.ok) throw new Error("Failed to fetch videos.");
        const data = await response.json();

        const processedData = data.map((video) => {
          let videoUrl = video.url || video.video;
          
          if (videoUrl?.includes('vimeo.com/') && !videoUrl.includes('player.vimeo.com')) {
            const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
            videoUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          
          if (videoUrl?.includes('?')) {
            videoUrl = videoUrl.split('?')[0];
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

  return (
    <div className="h-full flex flex-col px-[15px] md:px-[46px] overflow-hidden">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video : Mobile 41px, Desktop 17px - FIXED */}
          <div style={{ height: "41px" }} className="md:hidden flex-shrink-0" />
          <div style={{ height: "17px" }} className="hidden md:block flex-shrink-0" />

          <div className="source-sans-light flex flex-col md:flex-row md:gap-6 flex-shrink-0">
            {/* Player principal - FIXED SIZE on desktop */}
            <div className="w-full md:w-[860px] border border-black md:border-none relative z-10 flex-shrink-0">
              {selectedVideo && selectedVideo.url ? (
                <div
                  className="w-full relative bg-black"
                  style={{
                    height: "auto",
                    aspectRatio: "16/9"
                  }}
                >
                  <iframe
                    key={selectedVideo.id}
                    src={`${selectedVideo.url}?title=0&byline=0&portrait=0`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                      zIndex: 10
                    }}
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: "483.75px" }}>
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo - FIXED WIDTH on desktop */}
            <div className="w-full md:w-[300px] flex flex-col justify-start font-HelveticaNeue mt-4 md:mt-0 flex-shrink-0">
              <h3 className="text-2xl md:text-3xl md:mb-2">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel : Mobile 80px, Desktop 49px - FIXED */}
          <div style={{ height: "80px" }} className="md:hidden flex-shrink-0" />
          <div style={{ height: "49px" }} className="hidden md:block flex-shrink-0" />

          {/* Carrousel - Takes remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
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