import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Carousel from "./Carousel";
import Navbar from "./Navbar";

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
        
        // Convertir les URLs player.vimeo.com en vimeo.com pour ReactPlayer
        const processedData = data.map(video => ({
          ...video,
          url: video.url?.replace('https://player.vimeo.com/video/', 'https://vimeo.com/') || video.url
        }));
        
        setVideos(processedData);
        setSelectedVideo(processedData[0]);
      } catch (err) {
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
          <Navbar />

          {/* Espacement Navbar → Video : Mobile 41px, Desktop 68px */}
          <div style={{ height: '41px' }} className="md:hidden" />
          <div style={{ height: '68px' }} className="hidden md:block" />

          <div className="source-sans-light flex flex-col md:flex-row md:gap-6">
            {/* Player principal */}
            <div className="w-full border border-black md:w-[792px] md:h-[445px] md:border-none">
              {selectedVideo && (
                <div className="overflow-hidden roar-blue w-full md:w-[792px]" 
                     style={{
                       height: 'auto',
                       aspectRatio: '16/9'
                     }}>
                  <ReactPlayer
                    url={selectedVideo.url}
                    controls
                    playing={false}
                    muted={false}
                    width="100%"
                    height="100%"
                    style={{ aspectRatio: "16/9" }}
                    config={{
                      vimeo: {
                        playerOptions: {
                          autoplay: false,
                          muted: false,
                          controls: true
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:flex-1 flex flex-col justify-start font-HelveticaNeuet mt-4 md:mt-0">
              <h3 className="text-2xl md:text-3xl md:mb-0">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm font-HelveticaNeue">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Espacement Video → Carousel : Mobile 180px (incluant titre/desc), Desktop 49px */}
          <div style={{ height: '80px' }} className="md:hidden" />
          <div style={{ height: '49px' }} className="hidden md:block" />

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