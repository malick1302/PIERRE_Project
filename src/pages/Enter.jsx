import React, { useRef, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { gsap } from "gsap";
import Player from "@vimeo/player";

const Enter = () => {
  const overlayRef = useRef(null);
  const loaderRef = useRef([]);
  const videoRef = useRef(null);
  const enterButtonRef = useRef(null);
  const soundButtonRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleVideoLoad = () => {
    setVideoReady(true);
    fadeOutLoader();
  };

  const fadeOutLoader = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1,
      onComplete: () => setLoading(false),
    });

    gsap.to(videoRef.current, { opacity: 1, duration: 1 });

    gsap.fromTo(
      soundButtonRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 1, delay: 1 }
    );
    gsap.fromTo(
      enterButtonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 1.3 }
    );
  };

  const toggleMute = async () => {
    const player = new Player(videoRef.current);
    if (isMuted) {
      await player.setMuted(false);
      await player.setVolume(1);
      setIsMuted(false);
    } else {
      await player.setMuted(true);
      await player.setVolume(0);
      setIsMuted(true);
    }

    gsap.fromTo(
      soundButtonRef.current,
      { scale: 1.2 },
      { scale: 1, duration: 0.2, ease: "power1.out" }
    );
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden scrollbar-hide homet">
      {/* ✅ Navbar avec marge top responsive */}
      <div className="pt-roar-y-mobile md:pt-roar-y-desktop relative z-[100]">
        <Navbar />
      </div>

      {/* Vidéo Vimeo - FULLSCREEN sans marges */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <iframe
          ref={videoRef}
          loading="lazy"
          onLoad={handleVideoLoad}
          src="https://player.vimeo.com/video/1128797324?autoplay=1&loop=1&muted=1&background=1&quality=360p"
          className="absolute w-[450%] h-[130%] -translate-x-3/4 scale-125 top-0 left-0 md:w-[120%] md:h-[120%] md:-translate-x-1/2 md:-translate-y-1/2 md:scale-125"
          style={{ transform: "translate(-10%, -10%) scale(1.2)", opacity: 0 }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vidéo d'accueil"
        />
      </div>

      {/* Loader */}
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
        </div>
      )}

      {/* Contenu central */}
      {!loading && (
        <>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] pointer-events-auto">
            <button
              ref={enterButtonRef}
              className="px-8 py-4 text-[24px] font-semibold homet font-HelveticaNeue md:text-[40px]"
              onClick={() => (window.location.href = "/Home")}
            >
              Enter
            </button>
          </div>

          {/* ✅ Bouton Son - Marges spécifiques avec safe-area */}
          {/* Mobile: bottom avec safe-area-inset, Desktop: bottom + right avec mx-[36px] */}
          <div className="absolute bottom-[max(40px,env(safe-area-inset-bottom))] right-0 md:bottom-0 md:right-0 md:p-2 md:mx-[36px] z-[100] pointer-events-auto">
            <button
              ref={soundButtonRef}
              onClick={toggleMute}
              className="text-lg text-white transition-all duration-300 font-HelveticaNeue"
            >
              <img
                src={isMuted ? "/images/soundoff.png" : "/images/soundon.png"}
                alt={isMuted ? "Sound Off" : "Sound On"}
                className="h-[63px] w-[63px] md:mb-0 md:w-[100px] md:h-[100px]"
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Enter;