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
    <div className="flex-1 flex flex-col px-[15px] md:px-[46px] overflow-hidden">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video : Mobile 2vh, Desktop 2vh */}
          <div className="h-[2vh]" />

          <div className="source-sans-light flex flex-col md:flex-row md:gap-6 md:items-start flex-shrink-0">
            {/* Player principal */}
            <div className="w-full md:w-[60vw] md:max-w-[860px] border border-black md:border-none relative z-10">
              {selectedVideo && selectedVideo.url ? (
                <div
                  className="w-full relative bg-black"
                  style={{
                    paddingTop: "56.25%",
                    position: "relative"
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
                <div className="flex items-center justify-center h-[30vh] bg-gray-200">
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:flex-1 md:max-w-[300px] flex flex-col justify-start font-HelveticaNeue mt-4 md:mt-0">
              <h3 className="text-xl md:text-2xl md:mb-2">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel : Mobile 4vh, Desktop 3vh */}
          <div className="h-[4vh] md:h-[3vh]" />

          {/* Carrousel - prend l'espace restant */}
          <div className="flex-1 min-h-0">
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