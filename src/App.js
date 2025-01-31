import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AddMissingPersonPage from './pages/AddMissingPersonPage';
import YourProfilePage from './pages/YourProfilePage';
import AboutUsPage from './pages/AboutUsPage';
import NewImageUploadPage from './pages/NewImageUploadPage';
import FloatingButton from './components/FloatingButton';
import './App.css';

function App() {
  return (
    <MapProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/add-missing-person" element={<AddMissingPersonPage />} />
            <Route path="/your-profile" element={<YourProfilePage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/upload" element={<NewImageUploadPage />} />
          </Routes>
          <FloatingButton />
        </div>
      </Router>
    </MapProvider>
  );
}

export default App;