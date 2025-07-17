import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './LandlordPage.css';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';




export default function LandlordPage() {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user){
                navigate('/login');
                return;}
            const userRef = doc(db,"users", user.uid);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists() && userSnap.data().role === "Landlord"){
                setAllowed(true);
                setUserData(userSnap.data());
            }else {
                setAllowed(false);
            }
        setLoading(false)
    });
            return () => unsubscribe();

}, [navigate]);

    if (loading) {
        return <div>Loading...</div>;
    } if (!allowed) {
        return <div>You do not have permission to access this page.</div>;
    }

    return(
        <div className = "container">
            <div className = "navbar">
                <h2>{userData.name}'s Dashboard</h2>
                <div id = "listings">
                    <select id="my-listings" name = "my-listings">
                        <option value="" disabled selected>Select a listing</option>
                        <option value="listing1">Select Listing 1</option>
                        <option value="listing2">Select Listing 2</option>
                    </select>
                </div>
                <button className="btnNav">Add new listing</button>
                <button className="btnNav">Log Out</button>
                <button className="btnNav">Settings</button>
                <button className="btnNav">Contact us</button>

                <footer>
                    <p>&copy; 2025 Student Housing App</p>
                </footer>
            </div>
            <div className="content">
                <h1>Welcome, {userData.name}!</h1>
                <p>You are logged in as a Landlord.</p>
                <p>Here you can manage your listings and view applications.</p>
            </div>
        </div>
    )
}
