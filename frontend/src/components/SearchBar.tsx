function SearchBar() {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[420px]">
            <input
                type="text"
                placeholder="Search destination..."
                className="w-full px-4 py-3 rounded-xl shadow-md border border-gray-200 outline-none"
            />
        </div>
    );
}

export default SearchBar;