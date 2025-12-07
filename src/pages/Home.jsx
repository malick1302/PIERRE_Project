import React from 'react';
import VideoList from '../components/VideoList';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="h-screen w-screen overflow-hidden scrollbar-hide flex flex-col">
            <Navbar />
            <VideoList />
        </div>
    );
};

export default Home;