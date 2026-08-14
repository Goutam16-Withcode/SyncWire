import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import ProfilePage from './pages/ProfilePage';
import CallModal from './components/CallModal';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const App = () => {
    const { authUser } = useContext(AuthContext);

    return (
        <div className="bg-[url('/bgImage.svg')] bg-contain min-h-screen">
            <Toaster 
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#282142',
                        color: '#ffffff',
                        border: '1px solid #6b7280',
                        fontSize: '13px'
                    }
                }}
            />
            {/* Real-time Voice & Video Call Modal */}
            <CallModal />
            
            <Routes>
                <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/phone-login" element={!authUser ? <PhoneLoginPage /> : <Navigate to="/" />} />
                <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            </Routes>
        </div>
    );
};

export default App;




