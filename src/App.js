import './App.css';
import app from './firebase';
import React, { use, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import SignUp from './Signup/SignUp.js';
import Login from './Login/Login';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import DashboardHome from './DashboardHome/DashboardHome.js';
import DashboardLayout from './DashboardLayout';
import AddListing from './AddListing/AddListing.js';
import MyListings from './MyListings/MyListings.js';
import ContactForm from './ContactUs/ContactForm.js';
import Edit from './MyListings/Edit.js';
import DashboardStudentHome from './DashboardStudentHome/DashboardStudentHome.js';
import DashboardLayoutStudent from './DashboardLayoutStudent/DashboardLayoutStudent.js';
import FindHousing from './FindHousing/FindHousing.js';
import View from './FindHousing/View.js';
import FindRoommate from './FindRoommate/FindRoommate.js';


function Landing() {

  useEffect(() => {
    signOut(auth);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="container">
      <div id="landing">
        <h1>Welcome to the Student Housing App</h1>
        <p style={{color: 'darkgreen', fontSize: '1.2rem'}}><b>Your one-stop solution for finding student housing!</b></p>
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
        <button className="btnLandingPage" onClick={() => navigate('/signup')} >Sign Up</button>
        <button className="btnLandingPage" onClick={() => navigate('/login')} >Log In</button>
      </div>
      <footer className='footerLandingPage'>
        <p>&copy; 2025 Student Housing App</p>
      </footer>
    </div>

  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<DashboardLayoutStudent />}>
          <Route index element={<DashboardStudentHome />} />
          <Route path="/student-dashboard/find-housing" element={<FindHousing />} />
          <Route path="/student-dashboard/view-listing/:id" element={<View />} />
          <Route path="/student-dashboard/find-roommates" element={<FindRoommate />} />
          <Route path="/student-dashboard/contact" element={<ContactForm />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="/dashboard/my-listings" element={<MyListings />} />
          <Route path="/dashboard/add-listing" element={<AddListing />} />
          <Route path="/dashboard/contact" element={<ContactForm />} />
          <Route path="/dashboard/edit-listing/:id" element={<Edit />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;
