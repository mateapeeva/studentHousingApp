import NavbarStudent from '../NavbarStudent/NavbarStudent';
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './DashboardLayoutStudent.css';

export default function DashboardLayoutStudent() {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ ...userDoc.data(), email: user.email });
                }
            } else {
                setUserData(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return(
        <div className="dashboard-layout">
            <div className="navbar-layout">
                <NavbarStudent />
            </div>
            <main className='dashboard-content-layout'>
                <Outlet context={{ user: userData }} />
            </main>
        </div>
    );
}