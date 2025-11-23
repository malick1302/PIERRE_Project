import React from 'react';
import Navbar from "../components/Navbar";
import studio1 from "../assets/images/studio1.jpg";

const About = () => {
    return (
        <div className="h-screen overflow-hidden scrollbar-hide font-HelveticaNeue">
            <div className="min-h-screen px-[15px] md:px-[46px] py-4 md:py-6">
                <Navbar />

                <div className='flex flex-col md:flex-row md:gap-6 md:space-x-6'>
                    <div className='w-full mt-8 md:w-3/5 md:mt-9'>
                        <img src={studio1} alt="Photo 1 du studio" />
                    </div>
                    <div className='mt-12 w-full md:w-1/3 flex flex-col justify-start md:text-xl'>
                        <h3>Roar is a Paris-based studio crafting custom music and sound design for brands, fashion
                            and film. Clients include Coverse, Chiefs, Grand Marnier x Future, AD Council etc.
                        </h3>
                        <h2 className='mt-8'>
                            Contacts <br />
                            <a className='hover:text-red-500' href="mailto:test@test.com">test@test.com</a>
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;