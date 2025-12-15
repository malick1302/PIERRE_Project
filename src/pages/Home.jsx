import React from 'react';
import VideoList from '../components/VideoList';
import Navbar from '../components/Navbar';


const Home = () => {
    return (
        <div className="h-screen overflow-hidden scrollbar-hide">
           <div className="pt-roar-y-mobile md:pt-roar-y-desktop relative z-[100]">
                   <Navbar />
                 </div>
            < VideoList />

        </div>

    );

};

export default Home;