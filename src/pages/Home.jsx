import React from 'react';
import VideoList from '../components/VideoList';
import Navbar from '../components/Navbar';


const Home = () => {
    return (
        <div className="w-full overflow-y-auto scrollbar-hide">
           <div className="pt-roar-y-mobile md:pt-roar-y-desktop relative z-[100] md:pt-[18px]">
                   <Navbar />
                 </div>
            <VideoList />
        </div>
    );
};

export default Home;