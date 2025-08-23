import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import './DashboardStudentHome.css';




export default function DashboardStudentHome() {
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate('/login');
                return;
            }
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().role === "Student") {
                setAllowed(true);
                setUserData(userSnap.data());
            } else {
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

    return (
        <div className="content">
            <div className="text">
                <h1>Welcome, {userData.name}!</h1>
                <p>You are logged in as a Student</p>
            </div>
            <div className="cardsDashboard">
                <div className="cardDashboard">
                    <h2>Find Housing</h2>
                    <p>Browse through available housing options</p>
                </div>
                <div className="cardDashboard">
                    <h2>My Applications</h2>
                    <p>View and manage your pending applications for housing here</p>
                </div>
                <div className="cardDashboard">
                    <h2>Find Roommates</h2>
                    <p>Connect with other students looking for roommates</p>
                </div>
                <div className="cardDashboard">
                    <h2>Contact Us</h2>
                    <p>Get in touch with our support team for any inquiries</p>
                </div>
            </div>
            <div className="text">
                <h1>Thank you for using our platform!</h1>
                <p>We appreciate your trust in us</p>
            </div>
        </div>
    )
}
