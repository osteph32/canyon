import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report } from "../types";
import FeaturedDrives from "./FeaturedDrives";

type Coordinates = [number, number];

const createIcon = (emoji: string) =>
  L.divIcon({
    html: `<div style="font-size: 24px;">${emoji}</div>`,
    className: "",
    iconSize: [30, 30],
  });

const reportIcons: Record<string, L.DivIcon> = {
  police: createIcon("🚔"),
  accident: createIcon("💥"),
  traffic: createIcon("🚗"),
  hazard: createIcon("⚠️"),
};

function MapClickHandler({
  setPendingReportPosition,
  setIsModalOpen,
}: {
  setPendingReportPosition: (position: Coordinates) => void;
  setIsModalOpen: (open: boolean) => void;
}) {
  useMapEvents({
    click(e) {
      setPendingReportPosition([e.latlng.lat, e.latlng.lng]);
      setIsModalOpen(true);
    },
  });

  return null;
}

function RecenterMap({ position }: { position: Coordinates | null }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return null;
}

function FitBounds({ route }: { route: [number, number][] }) {
  const map = useMap();

  if (route.length > 0) {
    map.fitBounds(route);
  }

  return null;
}

export default function Map() {
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState<Coordinates[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: string;
    arrivalTime: string;
  } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingReportPosition, setPendingReportPosition] =
    useState<Coordinates | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/reports");
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);

        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve location");
      }
    );
  };

  const getRoute = async () => {
  if (!userPosition || !destination) {
    alert("Need your location and destination first");
    setRouteInfo(null);
    return;
  }

  try {
    const geocodeRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
    );
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.length) {
      alert("Destination not found");
      setRouteInfo(null);
      return;
    }

    const destCoords: Coordinates = [
      parseFloat(geocodeData[0].lat),
      parseFloat(geocodeData[0].lon),
    ];

    const orsApiKey = import.meta.env.VITE_ORS_API_KEY;

    const routeRes = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Authorization: orsApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [userPosition![1], userPosition![0]],
            [destCoords[1], destCoords[0]],
          ],
        }),
      }
    );

    const routeData = await routeRes.json();

    const summary = routeData.features[0].properties.summary;

    const distanceMiles = summary.distance * 0.000621371;
    const durationMinutes = Math.round(summary.duration / 60);

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    const formattedDuration =
    hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;

    const arrival = new Date(
      Date.now() + summary.duration * 1000
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    setRouteInfo({
      distance: distanceMiles,
      duration: formattedDuration,
      arrivalTime: arrival,
    });

    if (!routeData.features) {
      alert("Route failed");
      setRouteInfo(null);
      return;
    }

    const coordinates = routeData.features[0].geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    setRoute(coordinates);
  } catch (error) {
    console.error(error);
    alert("Failed to generate route");
  }
};

  const handleSelectReportType = async (type: string) => {
    if (!pendingReportPosition) return;

    const newReport: Report = {
      id: Date.now(),
      type,
      position: pendingReportPosition,
      timestamp: new Date().toISOString(),
      confirmations: 0,
      dismissals: 0,
    };

    try {
      await fetch("http://127.0.0.1:8000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReport),
      });

      fetchReports();
    } catch (error) {
      console.error(error);
      alert("Failed to save report");
    }

    setIsModalOpen(false);
    setPendingReportPosition(null);
  };

  const voteOnReport = async (
    reportId: number,
    vote: "confirm" | "dismiss"
  ) => {
    try {
      await fetch(
        `http://127.0.0.1:8000/reports/${reportId}/vote?vote=${vote}`,
        {
          method: "POST",
        }
      );

      fetchReports();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-xl shadow-lg flex gap-2">
        <button
          onClick={locateUser}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Locate Me
        </button>

        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={getRoute}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Route
        </button>
      </div>

      {isModalOpen && (
        <div className="absolute top-24 left-4 z-[1000] bg-white p-4 rounded-xl shadow-lg flex flex-col gap-2">
          <p className="font-semibold">Report Type</p>

          <button
            onClick={() => handleSelectReportType("police")}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            Police
          </button>

          <button
            onClick={() => handleSelectReportType("hazard")}
            className="bg-yellow-500 text-white px-3 py-2 rounded"
          >
            Hazard
          </button>

          <button
            onClick={() => handleSelectReportType("traffic")}
            className="bg-orange-500 text-white px-3 py-2 rounded"
          >
            Traffic
          </button>

          <button
            onClick={() => handleSelectReportType("accident")}
            className="bg-red-500 text-white px-3 py-2 rounded"
          >
            Accident
          </button>
        </div>
      )}

      {routeInfo && (
        <div className="absolute top-28 left-6 z-[1000] bg-white rounded-xl shadow-lg px-5 py-3">
          <p className="text-lg font-semibold text-gray-800">
            {routeInfo.duration} • {routeInfo.distance.toFixed(1)} mi
          </p>
          <p className="text-sm text-gray-500">
            Arrive by {routeInfo.arrivalTime}
          </p>
        </div>
      )}
        <FeaturedDrives />

      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap position={userPosition} />

        <MapClickHandler
          setPendingReportPosition={setPendingReportPosition}
          setIsModalOpen={setIsModalOpen}
        />

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {route.length > 0 && (
          <>
            <Polyline positions={route} color="blue" />
            <FitBounds route={route} />
          </>
        )}

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={report.position}
            icon={reportIcons[report.type]}
          >
            <Popup>
              <div className="flex flex-col gap-2">
                <p className="font-semibold capitalize">{report.type}</p>
                <p>✅ {report.confirmations}</p>
                <p>❌ {report.dismissals}</p>

                <button
                  onClick={() => voteOnReport(report.id, "confirm")}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Still There
                </button>

                <button
                  onClick={() => voteOnReport(report.id, "dismiss")}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Gone
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}