import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Carousel from "./Carousel";

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
    <div className="min-h-screen bg-roar-bg p-4 md:p-6">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Header avec ROAR Sound et INFO */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
            <div className="flex justify-end md:order-2 mb-2 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-roar-accent  font-source">INFO</h2>
            </div>
            <h1 className="text-4xl ml-7 font-robotto md:text-4xl text-roar-accent font-bold  md:order-1">ROAR Sound</h1>
          </div>

          {/* Conteneur principal avec vidéo et description */}
          <div className="flex flex-col md:flex-row flex gap-6 mb-3 ml-7  space-x-6">
            {/* Vidéo */}
            <div className="w-full md:w-3/5">
              {selectedVideo && (
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
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
            <div className="w-full md:w-1/3 flex flex-col justify-start ">
              <h3 className="text-2xl md:text-3xl font-bold text-roar-dark  mb-3 md:mb-4">
                {selectedVideo?.title}
              </h3>
              <p className="text-roar-dark  text-sm leading-relaxed">
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