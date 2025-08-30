import React, { use, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import './MyListings.css';
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";


function MyListings() {
    const [listings, setListings] = useState([]);
    const [carouselIndexes, setCarouselIndexes] = useState({});

    useEffect(() => {
        let unsubscribe;
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const querySnapshot = await getDocs(collection(db, "listings"));
                const listingsArr = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(listing => listing.landlordId === user.uid);
                setListings(listingsArr);
            } else {
                setListings([]);
            }
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    const handlePrev = (listingId, imagesLength) => {
        setCarouselIndexes(prev => ({
            ...prev,
            [listingId]: prev[listingId] > 0 ? prev[listingId] - 1 : imagesLength - 1
        }));
    };

    const handleNext = (listingId, imagesLength) => {
        setCarouselIndexes(prev => ({
            ...prev,
            [listingId]: prev[listingId] < imagesLength - 1 ? prev[listingId] + 1 : 0
        }));
    };

    return (
        <div>
            <div id="listingContainer">
                {listings.map(listing => {
                    const images = Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
                        ? listing.imageUrls
                        : listing.imageUrl ? [listing.imageUrl] : [];
                    const currentIdx = carouselIndexes[listing.id] || 0;
                    return (
                        <div key={listing.id} className="listingCard">
                            {images.length > 0 && (
                                <div className="imageContainer" >
                                    <img
                                        src={images[currentIdx]}
                                        alt={`Listing ${currentIdx + 1}`}
                                        className="listingImage"
                                    />
                                    {images.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 5,}}>
                                            <button className="btnNextBefore" type="button" onClick={() => handlePrev(listing.id, images.length)} style={{ marginRight: 10 }}>
                                                &lt;
                                            </button>
                                            <span style={{ alignSelf: 'center' }}>{currentIdx + 1} / {images.length}</span>
                                            <button className="btnNextBefore" type="button" onClick={() => handleNext(listing.id, images.length)} style={{ marginLeft: 10 }}>
                                                &gt;
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p className="listing-description"> {listing.descriptionAmenities}</p>
                            <p className="listing-description"><span style={{color: 'darkgreen', fontStyle: 'italic'}}>Price:</span> €{listing.price}</p>
                            <p className="listing-description"><span style={{color: 'darkgreen', fontStyle: 'italic'}}>Location:</span> {listing.address}</p>
                            <Link to={`/dashboard/edit-listing/${listing.id}`} className="edit-listing-btn">Edit</Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default MyListings;