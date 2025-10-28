import React from 'react';
import Navbar from "../components/Navbar";
import studio1 from "../assets/images/studio1.jpg";
// import studio2 from "../../public/images/studio2.jpg";

const About = () => {
    return (

        <div className="h-screen overflow-hidden scrollbar-hide font-HelveticaNeue">

            <div className="min-h-screen p-4 md:p-6 ">
                < Navbar />

                <div className='ml-0 flex flex-col md:flex-row flex md:gap-6  md:ml-0 md:mb-0 md:space-x-6'>
                    <div className='w-full mt-8 md:w-3/5 md:mt-9'>
                        <img src={studio1} alt="Photo 1 du studio" />
                    </div>
                    <div className='mt-12 w-full md:w-1/3 flex flex-col md: justify-start   md:text-xl  md:mb-0   '>
                        <h3>Roar is a Paris-based studio crafting custom music and sound design for brands, fashion
                            and film. Clients include Coverse, Chiefs, Grand Marnier x Future, AD Council etc.
                        </h3>
                        <h2 className='mt-8'>Contacts <br></br><a className='hover:text-red-500' href="test@test.com">test@test.com</a></h2>
                    </div>
                </div>
            </div>
        </div>

    );

};

export default About;