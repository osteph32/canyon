import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function CustomZoomControls() {
	const map = useMap();

	useEffect(() => {
		const zoomIn = () => map.zoomIn();
		const zoomOut = () => map.zoomOut();

		window.addEventListener("zoom-in", zoomIn);
		window.addEventListener("zoom-out", zoomOut);

		return () => {
			window.removeEventListener("zoom-in", zoomIn);
			window.removeEventListener("zoom-out", zoomOut);
		};
	}, [map]);

	return null;
}