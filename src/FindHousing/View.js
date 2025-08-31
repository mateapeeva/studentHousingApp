import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import './View.css';
import { addDoc } from "firebase/firestore";
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback } from 'react';


const MAPTILER_KEY = "kWS7KZmpJRLeVMdBOMaI";


function View() {
    const user = auth.currentUser;
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [landlord, setLandlord] = useState(null);
    const [coords, setCoords] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [phone, setPhone] = useState("");
    const [booking, setBooking] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [userFirstName, setUserFirstName] = useState("");

    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, "listings", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing(docSnap.data());
            } else {
                setListing(null);
            }
        };
        fetchListing();
    }, [id]);

    // Check if user has already applied for this listing
    useEffect(() => {
        const checkApplied = async () => {
            if (!user || !listing) return;
            const q = query(
                collection(db, "appointments"),
                where("listingId", "==", id),
                where("applicantName", "==", userFirstName)
            );
            const querySnapshot = await getDocs(q);
            setHasApplied(!querySnapshot.empty);
        };
        checkApplied();
    }, [user, listing, userFirstName, id, booking]);

    // Fetch available slots for this landlord
    useEffect(() => {
        const fetchSlots = async () => {
            if (!listing || !listing.landlordId) return;
            const q = query(
                collection(db, "appointments"),
                where("landlordId", "==", listing.landlordId),
                where("available", "==", true)
            );
            const querySnapshot = await getDocs(q);
            setAvailableSlots(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        if (showPopup) fetchSlots();
    }, [listing, showPopup]);

    // Get user first name from Firestore (if available), fallback to displayName/email
    useEffect(() => {
        const fetchUserName = async () => {
            if (user && user.uid) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (data.name) {
                        setUserFirstName(data.name);
                        return;
                    }
                }
                // fallback to displayName or email
                if (user.displayName) {
                    setUserFirstName(user.displayName.split(" ")[0]);
                } else if (user.email) {
                    setUserFirstName("");
                }
            }
        };
        fetchUserName();
    }, [user]);

    useEffect(() => {
        if (listing && listing.coordinates) {
            setCoords(listing.coordinates);
        }
    }, [listing]);

    useEffect(() => {
        const fetchLandlord = async () => {
            if (listing && listing.landlordId) {
                const landlordRef = doc(db, "users", listing.landlordId); // or "landlords" if that's your collection
                const landlordSnap = await getDoc(landlordRef);
                if (landlordSnap.exists()) {
                    setLandlord(landlordSnap.data());
                }
            }
        };
        fetchLandlord();
    }, [listing]);

    if (!listing) return <div>Loading or not found...</div>;

    const images = listing.imageUrls || [];

    const handlePrev = () => {
        setCurrentImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };





    return (
        <div className="containerView">
            <div className="imagesView">
                {images.length > 0 && (
                    <div className="image-previews">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                className="listing-image-view"
                                src={images[currentImgIdx]}
                                alt={`Listing ${currentImgIdx + 1}`}
                            />
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                                <button className="btnNextBefore" type="button" onClick={handlePrev} style={{ marginRight: 10 }}>
                                    &lt;
                                </button>
                                <span style={{ alignSelf: "center" }}>{currentImgIdx + 1} / {images.length}</span>
                                <button className="btnNextBefore" type="button" onClick={handleNext} style={{ marginLeft: 10 }}>
                                    &gt;
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="dataContainer">
                <div className="dataListing">
                    <p><b>Address:</b> {listing.address}</p>
                    <p><b>Price:</b> {listing.price}€</p>
                    <p><b>Description:</b> {listing.descriptionAmenities}</p>
                    <p><b>Number of Rooms:</b> {listing.numberOfRooms}</p>
                    {landlord && (
                        <p><b>Landlord:</b> {landlord.name} {landlord.surname}</p>
                    )}
                </div>
                {coords && (
                    <div className="map-container-view">
                        <Map
                            mapStyle="https://api.maptiler.com/maps/streets/style.json?key=kWS7KZmpJRLeVMdBOMaI"
                            style={{ width: '100%', height: '100%' }}
                            onLoad={() => console.log('Map loaded successfully')}
                            onError={(error) => console.error('Map error:', error)}
                            initialViewState={{
                                longitude: coords.lng,
                                latitude: coords.lat,
                                zoom: 15
                            }}
                        >
                            <Marker
                                longitude={coords.lng}
                                latitude={coords.lat}
                                color="red"
                            />
                        </Map>
                    </div>

                )}



                <button
                    className="btnApply"
                    onClick={() => { if (!hasApplied) setShowPopup(true); }}
                    disabled={hasApplied}
                    style={hasApplied ? { background: '#aaa', cursor: 'not-allowed' } : {}}
                >
                    {hasApplied ? "Applied" : "Apply"}
                </button>
                {showPopup && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!selectedSlot) return alert("Please select a slot");
                            setBooking(true);
                            try {
                                const slotRef = doc(db, "appointments", selectedSlot);
                                await updateDoc(slotRef, {
                                    available: false,
                                    applicantName: userFirstName,
                                    applicantPhone: phone,
                                    listingId: id,
                                    studentId: user ? user.uid : null
                                });
                                setShowPopup(false);
                                alert("Appointment booked!");
                            } catch (err) {
                                alert("Error booking: " + err.message);
                            } finally {
                                setBooking(false);
                            }
                        }} className="booking-form">
                            <h3 className="booking-form-title">Book Appointment</h3>
                            <label>
                                <select className="slot-select" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
                                    <option value="">Select a slot</option>
                                    {availableSlots.map(slot => (
                                        <option key={slot.id} value={slot.id}>{slot.date} at {slot.time}</option>
                                    ))}
                                </select>
                            </label><br /><br />
                            <label>
                                <input className="slot-number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Enter your phone number" />
                            </label><br /><br />
                            <button className="btnBook" type="submit" disabled={booking}>{booking ? "Booking..." : "Book"}</button>
                            <button className="btnBook" type="button" onClick={() => setShowPopup(false)} style={{ marginLeft: 8 }}>Cancel</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}


export default View;