import { useState } from "react";

type SearchBarProps = {
    onSearch: (query: string) => void;
};

function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;
        onSearch(query);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[420px]"
        >
            <input
                type="text"
                placeholder="Search destination..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl shadow-md border border-gray-200 outline-none"
            />
        </form>
    );
}

export default SearchBar;