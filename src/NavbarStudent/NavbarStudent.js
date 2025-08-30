import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import './NavbarStudent.css';

export default function NavbarStudent() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ name: '' });
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
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
            <Link to="/student-dashboard" className="btnNavHeader">{userData.name}'s Dashboard</Link>
            <Link to="/student-dashboard/find-housing" className="btnNav">Find Housing</Link>
            <Link to="/student-dashboard/my-applications" className="btnNav">My Applications</Link>
            <Link to="/student-dashboard/find-roommates" className="btnNav">Find Roommates</Link>
            <Link to="/student-dashboard/contact" className="btnNav">Contact Us</Link>
            <button className="btnNav" onClick={handleLogout}>Log Out</button>
            <footer>
                <p>&copy; 2025 Student Housing App</p>
            </footer>
        </nav>
    );
}

