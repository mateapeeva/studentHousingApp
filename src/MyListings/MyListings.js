import React, { use, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import './MyListings.css';

function MyListings() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchListings = async () => {
            const querySnapshot = await getDocs(collection(db, "listings"));
            const listingsArr = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setListings(listingsArr);
        };
        fetchListings();
    }, []);

    return (
        <div>
            <h2>My Listings</h2>
            <div id="listing-container">
                {listings.map(listing => (
                    <div key={listing.id} className="listing-card">
                        <p>Description: {listing.description}</p>
                        <p>Price: ${listing.price}</p>
                        <p>Location: {listing.address}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default MyListings;