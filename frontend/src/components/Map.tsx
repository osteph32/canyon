import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SearchBar from "./SearchBar";
import LocateButton from "./LocateButton";

function Map() {
    return (
        <div className="relative h-full w-full">
            <SearchBar />
            <LocateButton />

            <MapContainer
                center={[36.9741, -122.0308]}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full rounded-2xl"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[36.9741, -122.0308]}>
                    <Popup>Canyon starting point 🚗</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default Map;