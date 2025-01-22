import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

function Header() {
  return (
    <div className="navbar">
      <Link to="/" className="logo-container"> 
        <h1>ReConnect</h1>
      </Link>

      <div className="nav-links">
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/your-account">Your Account</Link>
        <Link to="/add-missing-person">Add Missing Person</Link>
      </div>
    </div>
  );
}

export default Header;
