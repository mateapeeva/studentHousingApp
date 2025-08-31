import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./MyApplications.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock } from '@fortawesome/free-solid-svg-icons';


function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user || !user.uid) return;
            // Find all appointments for this student by studentId
            const q = query(
                collection(db, "appointments"),
                where("studentId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const apps = [];
            for (const docSnap of querySnapshot.docs) {
                const appData = docSnap.data();
                // Fetch listing info
                let listingData = null;
                if (appData.listingId) {
                    const listingRef = doc(db, "listings", appData.listingId);
                    const listingSnap = await getDoc(listingRef);
                    if (listingSnap.exists()) {
                        listingData = listingSnap.data();
                    }
                }
                apps.push({ ...appData, id: docSnap.id, listing: listingData });
            }
            setApplications(apps);
            setLoading(false);
        };
        fetchApplications();
    }, [user]);

    if (loading) return <div>Loading...</div>;
    if (applications.length === 0) return <div>No applications found.</div>;

    return (
        <div className="my-applications">
            <h2 className="applied-title">My Applications</h2>
            <div className="applied-cards">
                {applications.map(app => (
                    <div className="applied-card" key={app.id}>

                        <Link className="infoAppointment" target="_blank" to={`/student-dashboard/view-listing/${app.listingId}`}>
                            Click to see the apartment
                        </Link>

                        <div className="infoAppointment">
                            <p><span><FontAwesomeIcon icon={faCalendarAlt} className="iconBooking" /></span>{app.date} <span><FontAwesomeIcon icon={faClock} className="iconBooking" /></span>{app.time}</p>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}

export default MyApplications;
