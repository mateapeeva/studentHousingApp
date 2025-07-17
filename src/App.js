import './App.css';
import app from './firebase';
import React, { use, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SignUp from './SignUp';
import Login from './Login';
import LandlordPage from './LandlordPage';
import StudentPage from './StudentPage';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';


function Landing(){

  useEffect(() => {
    signOut(auth);
  },[]);

  const navigate = useNavigate();

  return(
     <div className = "container">
      <div id="landing">
        <h1>Welcome to the Student Housing App</h1>
        <p>Your one-stop solution for finding student housing!</p>
      </div>
      <div id="cards">
        <div className="card">
          <h2>Find Your Home</h2>
          <p>Browse through a variety of student housing options.</p>
        </div>
        <div className="card">
          <h2>Post Listings</h2>
          <p>List your property for students to find.</p>
        </div>
        <div className="card">
          <h2>Find Roommates</h2>
          <p>Connect with other students looking for roommates.</p>
        </div>
      </div>
      <div id="buttons">
        <button className="btn" onClick={() => navigate('/signup')} >Sign Up</button>
        <button className="btn" onClick={() => navigate('/login')} >Log In</button>
      </div>
      <footer>
        <p>&copy; 2025 Student Housing App</p>
      </footer>
    </div>
  
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landlord" element={<LandlordPage />} />
        <Route path="/student" element={<StudentPage />} />
      </Routes>
    </Router>
  
  );
}

export default App;
