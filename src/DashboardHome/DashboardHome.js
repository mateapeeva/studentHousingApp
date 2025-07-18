import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import './DashboardHome.css';




export default function DashboardHome() {
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
            <div className="content">
                <h1>Welcome, {userData.name}!</h1>
                <p>You are logged in as a Landlord.</p>
                <p>Here you can manage your listings and view applications.</p>
            </div>
    )
}
