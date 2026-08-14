import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
    const { selectedUser, showContactInfo, activeTheme } = useContext(ChatContext);

    return (
        <div className={`w-full min-h-screen sm:px-[8%] xl:px-[12%] sm:py-[2.5%] transition-colors duration-300 ${activeTheme.appBgClass || "bg-[url('/bgImage.svg')] bg-cover"}`}>
            <div className={`border-2 rounded-2xl overflow-hidden h-[95vh] grid grid-cols-1 relative shadow-2xl transition-all duration-300 ${activeTheme.containerBgClass || 'bg-[#1e1534]/70 border-gray-600/60 backdrop-blur-2xl'} ${
                selectedUser 
                    ? showContactInfo
                        ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
                        : 'md:grid-cols-[1fr_2fr]'
                    : 'md:grid-cols-2'
            }`}>
                <Sidebar />
                <ChatContainer />
                {showContactInfo && <RightSidebar />}
            </div>
        </div>
    );
};

export default HomePage;



