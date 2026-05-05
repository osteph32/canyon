type LocateButtonProps = {
    onLocate: () => void;
};

function LocateButton({ onLocate }: LocateButtonProps) {
    return (
        <button
            onClick={onLocate}
            className="absolute bottom-6 right-6 z-[1000] bg-white shadow-md px-4 py-3 rounded-xl font-medium hover:bg-gray-100"
        >
            Locate Me
        </button>
    );
}

export default LocateButton;