import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo-container"> 
        <h1>ReConnect</h1>
      </Link>
  
      <Link to="/add-missing-person" className="add-button">Add Missing Person</Link>

      <div className="nav-links">
        <Link to="/" className="home-button">Home</Link>
        <div className="menu">
          <button onClick={toggleMenu} className="menu-button">Menu</button>
          {menuOpen && (
            <div className="dropdown-menu">
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
              <Link to="/your-profile">Your Profile</Link>
              <Link to="/about-us">Our Mission</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
