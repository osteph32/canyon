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
        alert(`Location error: ${error.message}`);
      }
    );
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );

      const data = await response.json();

      if (data.length === 0) {
        alert("Location not found");
        return;
      }

      const result = data[0];

      const newPosition: [number, number] = [
        parseFloat(result.lat),
        parseFloat(result.lon),
      ];

      setPosition(newPosition);
    } catch (error) {
      console.error(error);
      alert("Search failed");
    }
  };

  return (
    <div className="relative h-full w-full">
      <SearchBar onSearch={handleSearch} />
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
          <Popup>Selected location 🚗</Popup>
        </Marker>

        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}

export default Map;