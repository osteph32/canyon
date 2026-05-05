import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import SearchBar from "./SearchBar";
import LocateButton from "./LocateButton";
import type { Report } from "../types";

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  map.setView(position, 13);
  return null;
}

function ReportHandler({
  onAddReport,
}: {
  onAddReport: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onAddReport([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

function Map() {
  const [position, setPosition] = useState<[number, number]>([
    36.9741,
    -122.0308,
  ]);

  const [startPosition, setStartPosition] = useState<[number, number] | null>(
    null
  );

  const [route, setRoute] = useState<[number, number][]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const newPosition: [number, number] = [
          location.coords.latitude,
          location.coords.longitude,
        ];

        setPosition(newPosition);
        setStartPosition(newPosition);
      },
      (error) => {
        alert(`Location error: ${error.message}`);
      }
    );
  };

  const fetchRoute = async (
    start: [number, number],
    end: [number, number]
  ) => {
    try {
      const apiKey = import.meta.env.VITE_ORS_API_KEY;

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
      );

      const data = await response.json();

      const coordinates = data.features[0].geometry.coordinates;

      const formattedRoute = coordinates.map(
        (coord: number[]) => [coord[1], coord[0]] as [number, number]
      );

      setRoute(formattedRoute);
    } catch {
      alert("Route generation failed");
    }
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

      const destination: [number, number] = [
        parseFloat(result.lat),
        parseFloat(result.lon),
      ];

      setPosition(destination);

      if (startPosition) {
        fetchRoute(startPosition, destination);
      }
    } catch {
      alert("Search failed");
    }
  };

  const handleAddReport = (reportPosition: [number, number]) => {
    const type = prompt(
      "Enter report type: police, accident, traffic, hazard"
    );

    if (!type) return;

    const newReport: Report = {
      id: Date.now(),
      type,
      position: reportPosition,
    };

    setReports((prev) => [...prev, newReport]);
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
          <Popup>Destination 🚗</Popup>
        </Marker>

        {reports.map((report) => (
          <Marker key={report.id} position={report.position}>
            <Popup>{report.type}</Popup>
          </Marker>
        ))}

        {route.length > 0 && <Polyline positions={route} />}

        <ReportHandler onAddReport={handleAddReport} />
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}

export default Map;