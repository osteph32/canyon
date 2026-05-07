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
import CustomZoomControls from "./CustomZoomControls";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

type Coordinates = [number, number];

const createIcon = (emoji: string) =>
	L.divIcon({
		html: `
			<div
				style="
					font-size: 22px;
					display: flex;
					align-items: center;
					justify-content: center;
				"
			>
				${emoji}
			</div>
		`,
		className: "",
		iconSize: [30, 30],
	});

const reportIcons: Record<string, L.DivIcon> = {
	police: createIcon("🚔"),
	accident: createIcon("💥"),
	traffic: createIcon("🚗"),
	hazard: createIcon("⚠️"),
};

const userIcon = L.divIcon({
	html: `
		<div
			style="
				width: 18px;
				height: 18px;
				background: #256d4a;
				border: 3px solid white;
				border-radius: 999px;
				box-shadow: 0 0 10px rgba(0,0,0,0.25);
			"
		></div>
	`,
	className: "",
	iconSize: [18, 18],
});

function MapClickHandler({
	setPendingReportPosition,
	setIsModalOpen,
}: {
	setPendingReportPosition: (position: Coordinates) => void;

	setIsModalOpen: (open: boolean) => void;
}) {
	useMapEvents({
		click(e) {
			setPendingReportPosition([
				e.latlng.lat,
				e.latlng.lng,
			]);

			setIsModalOpen(true);
		},
	});

	return null;
}

function RecenterMap({
	position,
}: {
	position: Coordinates | null;
}) {
	const map = useMap();

	useEffect(() => {
		if (position) {
			map.setView(position, 13, {
				animate: true,
			});
		}
	}, [position, map]);

	return null;
}

function FitBounds({
	route,
}: {
	route: Coordinates[];
}) {
	const map = useMap();

	useEffect(() => {
		if (route.length > 0) {
			map.fitBounds(route, {
				padding: [60, 60],
			});
		}
	}, [route, map]);

	return null;
}

export default function Map() {
	const [userPosition, setUserPosition] =
		useState<Coordinates | null>(null);

	const [destination, setDestination] =
		useState("");

	const [route, setRoute] = useState<
		Coordinates[]
	>([]);

	const [reports, setReports] = useState<
		Report[]
	>([]);

	const [pendingReportPosition, setPendingReportPosition] =
		useState<Coordinates | null>(null);

	const [isModalOpen, setIsModalOpen] =
		useState(false);

	const [showDrives, setShowDrives] =
		useState(false);

	const [avoidTolls, setAvoidTolls] =
		useState(false);

	const [avoidHighways, setAvoidHighways] =
		useState(false);

	const [loadingRoute, setLoadingRoute] =
		useState(false);

	const [routeInfo, setRouteInfo] = useState<{
		distance: number;

		duration: string;

		arrivalTime: string;
	} | null>(null);

	useEffect(() => {
		fetchReports();

		locateUser();
	}, []);

	const fetchReports = async () => {
		try {
			const res = await fetch(
				"http://127.0.0.1:8000/reports"
			);

			const data = await res.json();

			setReports(data);
		} catch (error) {
			console.error(error);
		}
	};

	const locateUser = () => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserPosition([
					position.coords.latitude,
					position.coords.longitude,
				]);
			},
			(error) => {
				console.error(error);

				alert(
					"Unable to retrieve location"
				);
			}
		);
	};

	const getRoute = async () => {
		if (!userPosition || !destination) {
			alert(
				"Need your location and destination first"
			);

			return;
		}

		try {
			setLoadingRoute(true);

			const geocodeRes = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
			);

			const geocodeData =
				await geocodeRes.json();

			if (!geocodeData.length) {
				alert("Destination not found");

				return;
			}

			const destCoords: Coordinates = [
				parseFloat(geocodeData[0].lat),

				parseFloat(geocodeData[0].lon),
			];

			const orsApiKey =
				import.meta.env
					.VITE_ORS_API_KEY;

			const routeRes = await fetch(
				"https://api.openrouteservice.org/v2/directions/driving-car/geojson",
				{
					method: "POST",

					headers: {
						Authorization:
							orsApiKey,

						"Content-Type":
							"application/json",
					},

					body: JSON.stringify({
						coordinates: [
							[
								userPosition[1],
								userPosition[0],
							],

							[
								destCoords[1],
								destCoords[0],
							],
						],

						options: {
							avoid_features: [
								...(avoidTolls
									? [
											"tollways",
										]
									: []),

								...(avoidHighways
									? [
											"highways",
										]
									: []),
							],
						},
					}),
				}
			);

			const routeData =
				await routeRes.json();

			if (!routeData.features) {
				alert("Route failed");

				return;
			}

			const summary =
				routeData.features[0]
					.properties.summary;

			const distanceMiles =
				summary.distance *
				0.000621371;

			const durationMinutes =
				Math.round(
					summary.duration / 60
				);

			const hours = Math.floor(
				durationMinutes / 60
			);

			const minutes =
				durationMinutes % 60;

			const formattedDuration =
				hours > 0
					? `${hours} hr ${minutes} min`
					: `${minutes} min`;

			const arrival = new Date(
				Date.now() +
					summary.duration * 1000
			).toLocaleTimeString([], {
				hour: "numeric",

				minute: "2-digit",
			});

			setRouteInfo({
				distance: distanceMiles,

				duration: formattedDuration,

				arrivalTime: arrival,
			});

			const coordinates =
				routeData.features[0].geometry.coordinates.map(
					(coord: [
						number,
						number,
					]) =>
						[
							coord[1],
							coord[0],
						] as Coordinates
				);

			setRoute(coordinates);
		} catch (error) {
			console.error(error);

			alert(
				"Failed to generate route"
			);
		} finally {
			setLoadingRoute(false);
		}
	};

	const handleSelectReportType =
		async (type: string) => {
			if (!pendingReportPosition)
				return;

			const newReport: Report = {
				id: Date.now(),

				type,

				position:
					pendingReportPosition,

				timestamp:
					new Date().toISOString(),

				confirmations: 0,

				dismissals: 0,
			};

			try {
				await fetch(
					"http://127.0.0.1:8000/reports",
					{
						method: "POST",

						headers: {
							"Content-Type":
								"application/json",
						},

						body: JSON.stringify(
							newReport
						),
					}
				);

				fetchReports();
			} catch (error) {
				console.error(error);
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
		<div className="relative h-screen w-full overflow-hidden">
			<motion.div
				initial={{
					opacity: 0,
					y: -20,
				}}
				animate={{
					opacity: 1,
					y: 0,
				}}
				className="
					absolute
					top-4
					left-4
					z-[1000]
					bg-white/95
					backdrop-blur-md
					p-5
					rounded-3xl
					shadow-2xl
					flex
					flex-col
					gap-4
					w-[320px]
					max-w-[calc(100vw-32px)]
					border
					border-gray-200
				"
			>
				<div className="flex items-center gap-3">
					<img
						src={logo}
						alt="Canyon Logo"
						className="w-11 h-11 object-contain"
					/>

					<h1 className="text-3xl font-bold text-green-800">
						Canyon
					</h1>
				</div>

				<button
					onClick={locateUser}
					className="
						bg-green-600
						hover:bg-green-700
						transition
						text-white
						py-3
						rounded-xl
						font-medium
					"
				>
					Locate Me
				</button>

				<input
					type="text"
					placeholder="Enter destination"
					value={destination}
					onChange={(e) =>
						setDestination(
							e.target.value
						)
					}
					className="
						border
						border-gray-300
						rounded-xl
						px-4
						py-3
						outline-none
						focus:border-green-600
					"
				/>

				<button
					onClick={getRoute}
					className="
						bg-blue-600
						hover:bg-blue-700
						transition
						text-white
						py-3
						rounded-xl
						font-medium
					"
				>
					{loadingRoute
						? "Loading..."
						: "Get Route"}
				</button>

				<div className="border-t border-gray-200 pt-3 flex flex-col gap-2 text-sm">
					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={avoidTolls}
							onChange={() =>
								setAvoidTolls(
									!avoidTolls
								)
							}
						/>

						Avoid tolls
					</label>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={avoidHighways}
							onChange={() =>
								setAvoidHighways(
									!avoidHighways
								)
							}
						/>

						Avoid highways
					</label>
				</div>
			</motion.div>

			<button
				onClick={() =>
					setShowDrives(!showDrives)
				}
				className="
					absolute
					top-4
					right-4
					z-[1000]
					w-14
					h-14
					rounded-full
					bg-white/95
					backdrop-blur-md
					shadow-xl
					border
					border-gray-200
					flex
					items-center
					justify-center
					text-2xl
					hover:scale-105
					transition
				"
			>
				☰
			</button>

			<AnimatePresence>
				{showDrives && (
					<motion.div
						initial={{
							x: 300,
							opacity: 0,
						}}
						animate={{
							x: 0,
							opacity: 1,
						}}
						exit={{
							x: 300,
							opacity: 0,
						}}
						transition={{
							duration: 0.2,
						}}
						className="
							absolute
							top-20
							right-4
							z-[1000]
						"
					>
						<FeaturedDrives
							onSelectDrive={(
								location
							) => {
								setDestination(
									location
								);

								setShowDrives(
									false
								);

								setTimeout(() => {
									getRoute();
								}, 100);
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="absolute right-4 bottom-6 z-[1000] flex flex-col gap-3">
				<button
					onClick={() =>
						window.dispatchEvent(
							new Event(
								"zoom-in"
							)
						)
					}
					className="
						w-12
						h-12
						rounded-2xl
						bg-white/95
						backdrop-blur-md
						shadow-xl
						text-2xl
						font-medium
						hover:scale-105
						transition
					"
				>
					+
				</button>

				<button
					onClick={() =>
						window.dispatchEvent(
							new Event(
								"zoom-out"
							)
						)
					}
					className="
						w-12
						h-12
						rounded-2xl
						bg-white/95
						backdrop-blur-md
						shadow-xl
						text-2xl
						font-medium
						hover:scale-105
						transition
					"
				>
					−
				</button>
			</div>

			{routeInfo && (
				<motion.div
					initial={{
						opacity: 0,
						y: 10,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					className="
						absolute
						bottom-6
						left-1/2
						-translate-x-1/2
						z-[1000]
						bg-white
						rounded-3xl
						shadow-2xl
						px-6
						py-4
						border
						border-gray-200
					"
				>
					<p className="text-xl font-bold text-gray-800">
						{routeInfo.duration}
					</p>

					<p className="text-gray-600">
						{routeInfo.distance.toFixed(
							1
						)}{" "}
						mi
					</p>

					<p className="text-green-700 font-medium mt-1">
						Arrive by{" "}
						{
							routeInfo.arrivalTime
						}
					</p>
				</motion.div>
			)}

			{isModalOpen && (
				<div className="absolute top-24 left-4 z-[1000] bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-2">
					<p className="font-semibold">
						Report Type
					</p>

					<button
						onClick={() =>
							handleSelectReportType(
								"police"
							)
						}
						className="bg-blue-500 text-white py-2 rounded-lg"
					>
						Police
					</button>

					<button
						onClick={() =>
							handleSelectReportType(
								"hazard"
							)
						}
						className="bg-yellow-500 text-white py-2 rounded-lg"
					>
						Hazard
					</button>

					<button
						onClick={() =>
							handleSelectReportType(
								"traffic"
							)
						}
						className="bg-orange-500 text-white py-2 rounded-lg"
					>
						Traffic
					</button>

					<button
						onClick={() =>
							handleSelectReportType(
								"accident"
							)
						}
						className="bg-red-500 text-white py-2 rounded-lg"
					>
						Accident
					</button>
				</div>
			)}

			<MapContainer
				center={
					userPosition || [
						37.7749,
						-122.4194,
					]
				}
				zoom={13}
				zoomControl={false}
				className="h-full w-full"
			>
				<CustomZoomControls />

				<RecenterMap
					position={userPosition}
				/>

				<TileLayer
					attribution="&copy; OpenStreetMap contributors"
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				<MapClickHandler
					setPendingReportPosition={
						setPendingReportPosition
					}
					setIsModalOpen={
						setIsModalOpen
					}
				/>

				{userPosition && (
					<Marker
						position={userPosition}
						icon={userIcon}
					>
						<Popup>
							You are here
						</Popup>
					</Marker>
				)}

				{route.length > 0 && (
					<>
						<Polyline
							positions={route}
							pathOptions={{
								color:
									"#256d4a",

								weight: 6,

								opacity: 0.9,

								lineCap:
									"round",

								lineJoin:
									"round",
							}}
						/>

						<FitBounds
							route={route}
						/>
					</>
				)}

				{reports.map((report) => (
					<Marker
						key={report.id}
						position={
							report.position
						}
						icon={
							reportIcons[
								report.type
							]
						}
					>
						<Popup>
							<div className="flex flex-col gap-2">
								<p className="font-semibold capitalize">
									{
										report.type
									}
								</p>

								<p>
									✅{" "}
									{
										report.confirmations
									}
								</p>

								<p>
									❌{" "}
									{
										report.dismissals
									}
								</p>

								<button
									onClick={() =>
										voteOnReport(
											report.id,
											"confirm"
										)
									}
									className="bg-green-500 text-white px-2 py-1 rounded-lg"
								>
									Still
									There
								</button>

								<button
									onClick={() =>
										voteOnReport(
											report.id,
											"dismiss"
										)
									}
									className="bg-red-500 text-white px-2 py-1 rounded-lg"
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