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

  return (
    <div className="min-h-screen px-[15px] md:px-[46px]">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Espacement Navbar → Video : Mobile 41px, Desktop 68px */}
          <div style={{ height: "41px" }} className="md:hidden" />
          <div style={{ height: "17px" }} className="hidden md:block" />

          <div className="source-sans-light flex flex-col md:flex-row md:gap-6 md:items-start">
            {/* Player principal - Using iframe like Enter.jsx */}
            <div className="w-full md:w-[860px] md:border-none">
              {selectedVideo && selectedVideo.url ? (
                <div
                  className="overflow-hidden roar-blue w-full md:w-[850px] relative"
                  style={{
                    height: "auto",
                    aspectRatio: "16/9",
                  }}
                >
                  <iframe
                    key={selectedVideo.id} // Force reload when video changes
                    src={`${selectedVideo.url}?autoplay=0&loop=0&muted=0`}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] md:h-[483px] bg-gray-200">
                  <p>Loading video...</p>
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:w-[300px] flex flex-col justify-start font-HelveticaNeue font-light mt-4 md:mt-0 md:ml-[20.99px] md:mt-[19.41px]">
              <h3 className="text-2xl md:text-[20px] md:mb-[43px]">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel : Mobile 180px (incluant titre/desc), Desktop 49px */}
          <div style={{ height: "80px" }} className="md:hidden" />
          <div style={{ height: "35.9px" }} className="hidden md:block" />

          {/* Carrousel */}
          <Carousel
            videos={videos}
            onSelectVideo={setSelectedVideo}
            selectedVideo={selectedVideo}
          />
        </>
      )}
    </div>
  );
}