import React from "react";
import Navbar from "../components/Navbar";

const Enter = () => {
  return (

    <div className="relative w-screen h-screen overflow-hidden">
      {/* Wrapper pour forcer le zoom */}
      <div>
      <Navbar />
      </div>
     
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <iframe
          src="https://player.vimeo.com/video/524933864?autoplay=1&loop=1&muted=1&background=1"
          className="absolute w-[450%] h-[130%] -translate-x-3/4 scale-125 top-0 left-0 md:w-[120%] md:h-[120%] md:-translate-x-1/2 md:-translate-y-1/2 md:scale-125"
          style={{ transform: "translate(-10%, -10%) scale(1.2)" }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vidéo d'accueil"
        />
      </div>

      {/* Bouton centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="px-8 py-4 text-lg font-semibold text-white bg-black/60 rounded-full hover:bg-black/80 transition-all duration-300">
          Entrer
        </button>
      </div>
    </div>

  );
};

export default Enter;
