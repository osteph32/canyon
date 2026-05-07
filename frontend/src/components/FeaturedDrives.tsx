import { useState } from "react";

type Props = {
	onSelectDrive: (location: string) => void;
};

const drives = [
	{
		name: "Pacific Coast Highway",
		location: "California",
		time: "3 hr 10 min",
		distance: "123 mi",
	},
	{
		name: "Angeles Crest Highway",
		location: "Los Angeles",
		time: "2 hr 5 min",
		distance: "66 mi",
	},
	{
		name: "Malibu Canyon Loop",
		location: "Malibu",
		time: "1 hr 20 min",
		distance: "41 mi",
	},
];

export default function FeaturedDrives({ onSelectDrive }: Props) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setOpen(!open)}
				className="absolute top-4 right-4 z-[1001] w-14 h-14 rounded-full bg-white shadow-xl border flex items-center justify-center hover:scale-105 transition"
			>
				<div className="w-6 h-6 rounded-full border-2 border-gray-400" />
			</button>

            {open && (
                <div
                    className="absolute inset-0 bg-black/10 z-[999]"
                    onClick={() => setOpen(false)}
                />
            )}

			<div
				className={`
					absolute top-20 right-4 z-[1000]
					bg-white rounded-2xl shadow-xl p-5 w-[320px]
					transition-all duration-300
					${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
				`}
			>
				<h2 className="text-2xl font-bold mb-4">
					Featured Drives
				</h2>

				<div className="flex flex-col gap-4">
					{drives.map((drive) => (
						<button
							key={drive.name}
							onClick={() => {
								onSelectDrive(drive.location);
								setOpen(false);
							}}
							className="border rounded-xl p-4 text-left hover:bg-gray-50 transition"
						>
							<h3 className="font-bold text-xl">
								{drive.name}
							</h3>

							<p className="text-gray-500">
								{drive.location}
							</p>

							<p className="mt-2 text-sm">
								{drive.time} • {drive.distance}
							</p>
						</button>
					))}
				</div>
			</div>
		</>
	);
}