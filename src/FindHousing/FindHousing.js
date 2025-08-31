import React, { use, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import './FindHousing.css';
import { Link } from "react-router-dom";
import { calculateDistance, filterListingsByRadius } from "../utils/geoUtils";


function FindHousing() {
    const [listings, setListings] = useState([]);
    const [carouselIndexes, setCarouselIndexes] = useState({});

    const [filters, setFilters] = useState({
        numberOfRooms: "",
        priceMin: "",
        priceMax: "",
        apartmentSizeMin: "",
        apartmentSizeMax: "",
        locations: [],
        radius: ""
    });

    const [showFilters, setShowFilters] = useState(false);

    const locationOptions = [
        { label: "Faculty of Computer Science & Engineering", value: { name: "Faculty of Computer Science & Engineering", address: "Faculty of Computer Science and Engineering, Skopje, North Macedonia", lat: 42.00416139045426, lng: 21.409536053836838 } },
        { label: "Faculty of Economics", value: { name: "Faculty of Economics", address: "Faculty of Economics, Skopje, North Macedonia", lat: 42.000987356632294, lng: 21.4431244478323 } },
        { label: "Faculty of Architecture", value: { name: "Faculty of Architecture", address: "Faculty of Architecture, Skopje, North Macedonia", lat: 41.99987663972871, lng: 21.419160546863143 } },
        { label: "Faculty of Medicine", value: { name: "Faculty of Medicine", address: "Faculty of Medicine, Skopje, North Macedonia", lat: 41.989776850704686, lng: 21.424374639398117 } },
        { label: "Faculty of Natural Sciences & Mathematics", value: { name: "Faculty of Natural Sciences & Mathematics", address: "Faculty of Natural Sciences & Mathematics, Skopje, North Macedonia", lat: 42.003288321756784, lng: 21.449866882535055 } },
        // Add more locations as needed
    ];


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

    const filteredListings = listings.filter(listing => {
        // Number of rooms
        if (filters.numberOfRooms && Number(listing.numberOfRooms) !== Number(filters.numberOfRooms)) return false;
        // Price
        if (filters.priceMin && Number(listing.price) < Number(filters.priceMin)) return false;
        if (filters.priceMax && Number(listing.price) > Number(filters.priceMax)) return false;
        // Apartment size
        if (filters.apartmentSizeMin && Number(listing.apartmentSize) < Number(filters.apartmentSizeMin)) return false;
        if (filters.apartmentSizeMax && Number(listing.apartmentSize) > Number(filters.apartmentSizeMax)) return false;

        // Location and radius filtering
        if (filters.locations.length > 0 && filters.radius) {
            const selectedLocation = filters.locations[0];
            if (!listing.coordinates || !listing.coordinates.lat || !listing.coordinates.lng) {
                return false; // Skip listings without coordinates
            }

            const distance = calculateDistance(
                selectedLocation.lat,
                selectedLocation.lng,
                listing.coordinates.lat,
                listing.coordinates.lng
            );

            if (distance > Number(filters.radius)) return false;
        }

        return true;
    });

    return (
        <div>
            <button onClick={() => setShowFilters(true)} className="filter">Filter appartments here</button>
            {showFilters && (
                <div className="popUpFilters">
                    <div className="filtersDIV">
                        <form className="filtersForm">
                            {/* Number of rooms */}
                            <input
                                type="number"
                                value={filters.numberOfRooms}
                                onChange={e => setFilters({ ...filters, numberOfRooms: e.target.value })}
                                placeholder="Number of rooms"
                                className="filterInput"
                            />
                            {/* Price min/max */}
                            <input
                                type="number"
                                value={filters.priceMax}
                                onChange={e => setFilters({ ...filters, priceMax: e.target.value })}
                                placeholder="Max price"
                                className="filterInput"

                            />
                            {/* Apartment size min/max */}
                            <input
                                type="number"
                                value={filters.apartmentSizeMin}
                                onChange={e => setFilters({ ...filters, apartmentSizeMin: e.target.value })}
                                placeholder="Min size"
                                className="filterInput"

                            />
                            <label>
                                <select
                                    className="filterInput"
                                    value={filters.locations[0]?.name || ""}
                                    onChange={e => {
                                        const selected = locationOptions.find(loc => loc.value.name === e.target.value);
                                        setFilters({ ...filters, locations: selected ? [selected.value] : [] });
                                    }}
                                >
                                    <option value="">Select location</option>
                                    {locationOptions.map(loc => (
                                        <option key={loc.label} value={loc.value.name}>{loc.label}</option>
                                    ))}
                                </select>
                            </label>
                            {/* Radius */}
                            <input
                                type="number"
                                value={filters.radius}
                                onChange={e => setFilters({ ...filters, radius: e.target.value })}
                                placeholder="Radius (km)"
                                className="filterInput"

                            />
                            <button className="btnFilter" type="button" onClick={() => { setShowFilters(false); }}>Filter</button>
                        </form>
                    </div>
                </div>
            )}
            <div id="listing-container">
                {filteredListings.map(listing => {
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
                            <p className="listing-description">{listing.descriptionAmenities}</p>
                            <p className="listing-description"><span style={{ color: 'darkgreen', fontStyle: 'italic' }}>Price:</span> €{listing.price}</p>
                            <p className="listing-description"><span style={{ color: 'darkgreen', fontStyle: 'italic' }}>Location:</span> {listing.address}</p>
                            <Link className="btnView" target="_blank" to={`/student-dashboard/view-listing/${listing.id}`}>View</Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default FindHousing;