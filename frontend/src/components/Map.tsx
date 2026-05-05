import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
    return (
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
    );
}

export default Map;