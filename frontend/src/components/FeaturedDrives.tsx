const drives = [
    {
        name: "Pacific Coast Highway",
        location: "California",
        distance: "123 mi",
        duration: "3 hr 10 min",
    },
    {
        name: "Angeles Crest Highway",
        location: "Los Angeles",
        distance: "66 mi",
        duration: "2 hr 5 min",
    },
    {
        name: "Malibu Canyon Loop",
        location: "Malibu",
        distance: "41 mi",
        duration: "1 hr 20 min",
    },
];

function FeaturedDrives() {
    return (
        <div className="absolute top-24 right-6 z-[1000] w-80 bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-xl font-bold mb-3 text-gray-800">
                Featured Drives
            </h2>

            <div className="space-y-3">
                {drives.map((drive) => (
                    <div
                        key={drive.name}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    >
                        <h3 className="font-semibold text-gray-800">{drive.name}</h3>
                        <p className="text-sm text-gray-500">{drive.location}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {drive.duration} • {drive.distance}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeaturedDrives;