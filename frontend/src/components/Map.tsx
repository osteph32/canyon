import { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import SearchBar from "./SearchBar";
import LocateButton from "./LocateButton";

function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    map.setView(position, 13);
    return null;
}

function Map() {
    const [position, setPosition] = useState<[number, number]>([
        36.9741,
        -122.0308,
    ]);

    const handleLocate = () => {
        navigator.geolocation.getCurrentPosition(
            (location) => {
                const newPosition: [number, number] = [
                    location.coords.latitude,
                    location.coords.longitude,
                ];
                setPosition(newPosition);
            },
            (error) => {
                console.error("Location error:", error);
                alert("Unable to retrieve your location");
            }
        );
    };

    return (
        <div className="relative h-full w-full">
            <SearchBar />
            <LocateButton onLocate={handleLocate} />

            <MapContainer
                center={position}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full rounded-2xl"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position}>
                    <Popup>You are here 🚗</Popup>
                </Marker>

                <RecenterMap position={position} />
            </MapContainer>
        </div>
    );
}

export default Map;