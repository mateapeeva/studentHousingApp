import React from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import './Navbar.css';

export default function Navbar() {
    const [userData, setUserData] = useState({ name: '' });
    const handleLogout = async () => {
        await signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } else {
                setUserData({ name: '' });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="btnNavHeader">{userData.name}'s Dashboard</Link>
            <Link to="/dashboard/my-listings" className="btnNav">My Listings</Link>
            <Link to="/dashboard/add-listing" className="btnNav">Add Listing</Link>
            <Link to="/settings" className="btnNav">Settings</Link>
            <button className="btnNav" onClick={handleLogout}>Log Out</button>
            <Link to="/contact" className="btnNav">Contact Us</Link>
            <footer>
                <p>&copy; 2025 Student Housing App</p>
            </footer>
        </nav>
    );
}

