import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import './View.css';
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../firebase";
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback } from 'react';


const MAPTILER_KEY = "kWS7KZmpJRLeVMdBOMaI";


function View() {

    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [currentImgIdx, setCurrentImgIdx] = useState(0);
    const [landlord, setLandlord] = useState(null);



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

    const [coords, setCoords] = useState(null);

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



                <button className="btnApply">Apply</button>
            </div>
        </div>
    );
}


export default View;