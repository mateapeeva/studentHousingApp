import React, { use, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import './FindHousing.css';
import { Link } from "react-router-dom";


function FindHousing() {
    const [listings, setListings] = useState([]);
    const [carouselIndexes, setCarouselIndexes] = useState({});

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
            <div id="listing-container">
                {listings.map(listing => {
                    const images = Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
                        ? listing.imageUrls
                        : listing.imageUrl ? [listing.imageUrl] : [];
                    const currentIdx = carouselIndexes[listing.id] || 0;
                    return (
                        <div key={listing.id} className="listing-card">
                            {images.length > 0 && (
                                <div className="image-container" >
                                    <img
                                        src={images[currentIdx]}
                                        alt={`Listing ${currentIdx + 1}`}
                                        className="listing-image"
                                    />
                                    {images.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
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
                            <p className="listing-description"><b>Description:</b> {listing.descriptionAmenities}</p>
                            <p className="listing-description"><b>Price:</b> €{listing.price}</p>
                            <p className="listing-description"><b>Location:</b> {listing.address}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FindHousing;