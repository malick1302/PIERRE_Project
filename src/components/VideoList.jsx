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
        if (!response.ok) {
          throw new Error("Failed to fetch videos. Please try again later.");
        }
        const data = await response.json();
        setVideos(data);
        setSelectedVideo(data[0]);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    console.log("Selected video updated:", selectedVideo);
  }, [selectedVideo]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
     
     < Navbar />

          {/* Conteneur principal avec vidéo et description */}
          <div className="ml-0 source-sans-light  flex flex-col md:flex-row flex md:gap-6  md:ml-0 md:mb-0 md:space-x-6">
            {/* Vidéo */}
            <div className="w-full  md:w-4/6">
              {selectedVideo && (
                <div className="overflow-hidden shadow-2xl roar-blue">
                  <ReactPlayer
                    key={selectedVideo.id}
                    url={selectedVideo.url}
                    controls
                    width="100%"
                    height="100%"
                    style={{ aspectRatio: '16/9' }}
                  />
                </div>
              )}
            </div>

            {/* Titre et description */}
            <div className="w-full md:w-1/3 flex flex-col justify-start">
              <h3 className="text-2xl md:text-3xl  md:mb-0">
                {selectedVideo?.title}
              </h3>
              <p className="text-sm">
                {selectedVideo?.description}
              </p>
            </div>
          </div>

          {/* Carousel en bas */}
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