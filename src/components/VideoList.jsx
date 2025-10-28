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
        setVideos(data);
        setSelectedVideo(data[0]);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen pl-4 pr-4 md:pr-4 md:pl-6">
      {error ? (
        <div className="text-red-500 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <Navbar />

          <div className="ml-0 source-sans-light flex flex-col md:flex-row md:mt-3 md:pl-20 md:gap-6 md:ml-0 md:mb-0 md:space-x-6">
            {/* Player principal */}
            <div className="w-full border border-black md:w-4/6">
              {selectedVideo && (
                <div className="overflow-hidden roar-blue">
 <ReactPlayer
  url={selectedVideo.url}   // Laisse l'URL publique de Vimeo
  controls
  playing
  muted
  width="100%"
  height="100%"
  style={{ aspectRatio: '16/9' }}
  config={{
    vimeo: { playerOptions: { autoplay: true, muted: true } }
  }}
/>



                </div>
              )}
            </div>

            {/* Infos vidéo */}
            <div className="w-full md:w-1/3 flex flex-col justify-start font-HelveticaNeuet">
              <h3 className="text-2xl md:text-3xl md:mb-0">{selectedVideo?.title}</h3>
              <p className="text-sm font-HelveticaNeue">{selectedVideo?.description}</p>
            </div>
          </div>

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
