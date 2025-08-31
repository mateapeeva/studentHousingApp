
import React, { useEffect, useState } from "react";
import { addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import './ViewApplicants.css'
import { Link } from "react-router-dom";


function ViewApplicants({ landlordId: propLandlordId, listingId }) {
    const [appointments, setAppointments] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [adding, setAdding] = useState(false);
    const [landlordId, setLandlordId] = useState(propLandlordId || null);

    // Fetch landlordId from auth if not provided
    useEffect(() => {
        if (!propLandlordId && auth.currentUser) {
            setLandlordId(auth.currentUser.uid);
        }
    }, [propLandlordId]);

    // Fetch booked appointments for this landlord from Firestore
    useEffect(() => {
        const fetchAppointments = async () => {
            if (!landlordId) return;
            const q = query(
                collection(db, "appointments"),
                where("landlordId", "==", landlordId),
                where("available", "==", false)
            );
            const querySnapshot = await getDocs(q);
            setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchAppointments();
    }, [landlordId, adding]);
    const bookedAppointments = appointments;

    // Add appointment slot
    const handleAddSlot = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            if (!landlordId) throw new Error("No landlordId found");
            await addDoc(collection(db, "appointments"), {
                landlordId,
                listingId: listingId || "",
                date,
                time,
                available: true,
                applicantName: "",
                applicantPhone: ""
            });
            setDate("");
            setTime("");
            setShowPopup(false);
        } catch (err) {
            alert("Error adding slot: " + err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <button className="add-slot-button" onClick={() => setShowPopup(true)}>Add Appointment Slot</button>
            {showPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form className="add-slot-form" onSubmit={handleAddSlot}>
                        <label>
                            <input className="add-slot-input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </label><br /><br />
                        <label>
                            <input className="add-slot-input" type="time" value={time} onChange={e => setTime(e.target.value)} required />
                        </label><br /><br />
                        <button className="btnAddSlot" type="submit" disabled={adding} onClick={handleAddSlot}>{adding ? "Adding..." : "Add Slot"}</button>
                        <button className="btnAddSlot" type="button" onClick={() => setShowPopup(false)} style={{ marginLeft: 8 }}>Cancel</button>
                    </form>
                </div>
            )}
            {bookedAppointments.length === 0 ? (
                <p>No appointments booked yet.</p>
            ) : (
                <div className="table-container">
                    <table className="table-applicant" border="1" cellPadding="8" cellSpacing="0">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Applicant Name</th>
                                <th>Applicant Phone</th>
                                <th>Listing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookedAppointments.map((appt) => (
                                <tr key={appt.id}>
                                    <td>{appt.date}</td>
                                    <td>{appt.time}</td>
                                    <td>{appt.applicantName}</td>
                                    <td>{appt.applicantPhone}</td>
                                    <td><Link className="view-details-link" to={`/dashboard/edit-listing/${appt.listingId}`}>View Details</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ViewApplicants;