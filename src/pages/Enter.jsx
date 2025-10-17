import React, { useRef, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { gsap } from "gsap";
import Video from "../assets/videos/Video.mp4"

const Enter = () => {
  const overlayRef = useRef(null);
  const loaderRef = useRef([]);
  const videoRef = useRef(null);
  const buttonRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Animation des petits cercles du loader
    gsap.fromTo(
      loaderRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 0.6,
        ease: "power1.inOut",
      }
    );

    // Fin du loader après 2 secondes
    const timer = setTimeout(() => {
      gsap.to(overlayRef.current, { opacity: 0, duration: 1, onComplete: () => setLoading(false) });
      gsap.fromTo(videoRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
      gsap.fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Wrapper pour forcer le zoom */}
      <div className="min-h-screen p-4 md:p-6 relative z-50">
  <Navbar />
</div>

      {/* Vidéo fullscreen */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {/* <iframe
          ref={videoRef}
          src="https://player.vimeo.com/video/524933864?autoplay=1&loop=1&muted=1&background=1"
          className="absolute w-[450%] h-[130%] -translate-x-3/4 scale-125 top-0 left-0 md:w-[120%] md:h-[120%] md:-translate-x-1/2 md:-translate-y-1/2 md:scale-125"
          style={{ transform: "translate(-10%, -10%) scale(1.2)", opacity: 0 }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vidéo d'accueil"
        /> */}
<div className="absolute top-0 left-0 w-full h-full overflow-hidden">
  <video
    ref={videoRef}
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-[450%] h-[130%] -translate-x-3/4 scale-125 md:w-[120%] md:h-[120%] md:-translate-x-1/2 md:-translate-y-1/2 md:scale-12 object-cover"
    style={{ transform: "translate(-10%, -10%) scale(1.2)", opacity: 1 }}
  >
    <source src={Video} type="video/mp4" />
  </video>
</div>


      </div>

      {/* Overlay de chargement */}
      {loading && (
        <div
          ref={overlayRef}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
        >
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                ref={(el) => (loaderRef.current[i] = el)}
                className="w-4 h-4 rounded-full bg-white"
              />
            ))}
          </div>
          <p className="text-white mt-4 text-lg tracking-wide"></p>
        </div>
      )}

      {/* Bouton centré */}
      {!loading && (
      <div
      ref={buttonRef}
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto"
    >
      <button
        className="px-8 py-4 text-lg font-semibold text-white bg-black/30 hover:bg-black/80 transition-all duration-300"
        onClick={() => window.location.href = "/Home"}
      >
        Entrer
      </button>
    </div>
    
      )}
    </div>
  );
};

export default Enter;
