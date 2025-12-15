import React from 'react';
import Navbar from "../components/Navbar";
import studio3 from "../assets/images/studio3.png";

const About = () => {
    return (
        <div className="min-h-screen scrollbar-hide font-HelveticaNeue">
            {/* Navbar avec marges top */}
            <div className="pt-roar-y-mobile md:pt-roar-y-desktop relative z-[100]">
                <Navbar />
            </div>

            {/* Contenu principal avec marges horizontales */}
            <div className="px-roar-x-mobile md:px-roar-x-desktop">
                
                {/* Layout Desktop : Image + Contact côte à côte */}
                <div className="flex flex-col md:flex-row md:gap-[54px] mt-[41px] md:mt-[17px]">
                    
                    {/* Colonne gauche : Image + Description dessous */}
                    <div className="w-full md:flex-1">
                        {/* Image */}
                        <img
                            src={studio3}
                            alt="Photo du studio"
                            className="w-full aspect-[981/544] object-cover"
                        />
                        
                        {/* ✅ Description EN DESSOUS de l'image (desktop) */}
                        <h3 className="font-light text-[20px] leading-[26px] mt-8">
                            ROAR is a Paris-based studio crafting music and sound design for brands, fashion
                            and film. Past clients include Converse, Chiefs, Grand Marnier x Future, AD Council etc.
                        </h3>
                    </div>

                    {/* ✅ Contact À DROITE de l'image (desktop uniquement) */}
                    <div className="hidden md:block md:w-[400px] md:flex-shrink-0">
                        <div className="font-light text-[20px] leading-[26px]">
                            <p className="mb-2">Contact:</p>
                            <p>Pierre Ronin, Aristide Rosier</p>
                            <a 
                                className="hover:underline" 
                                href="mailto:contact@roar-music.com"
                            >
                                contact@roar-music.com
                            </a>
                            <p>@Instagram</p>
                        </div>
                    </div>

                </div>

                {/* ✅ Contact EN BAS sur mobile */}
                <div className="block md:hidden mt-8">
                    <div className="font-light text-[20px] leading-[26px]">
                        <p className="mb-2">Contact:</p>
                        <p>Pierre Ronin, Aristide Rosier</p>
                        <a 
                            className="hover:underline" 
                            href="mailto:contact@roar-music.com"
                        >
                            contact@roar-music.com
                        </a>
                        <p>@Instagram</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;