import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import YourAccountPage from './pages/YourAccountPage';
import YourListingsPage from './pages/YourListingsPage';
import AboutUsPage from './pages/AboutUsPage';
import AddMissingPersonPage from './pages/AddMissingPersonPage';
import NewImageUploadPage from './pages/NewImageUploadPage'; // Updated to use the new page
import FloatingButton from './components/FloatingButton'; // Import the FloatingButton
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/your-account" element={<YourAccountPage />} />
        <Route path="/your-listings" element={<YourListingsPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/add-missing-person" element={<AddMissingPersonPage />} />
        <Route path="/upload" element={<NewImageUploadPage />} /> {/* Updated route */}
      </Routes>
      <FloatingButton /> {/* Add the FloatingButton here */}
    </BrowserRouter>
  );
}

export default App;
