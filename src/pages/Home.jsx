import React from 'react';
import VideoList from '../components/VideoList';
import Navbar from '../components/Navbar';


const Home = () => {
    return (
        <div className="h-screen overflow-hidden scrollbar-hide">
            <Navbar />
            < VideoList />

        </div>

    );

};

export default Home;