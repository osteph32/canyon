function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#DDE8D8]">
      <header className="h-16 flex items-center justify-between px-6 shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-[#2F6B4F]">Canyon</h1>

        <nav className="flex gap-6 text-sm font-medium text-gray-700">
          <button>Navigate</button>
          <button>Report</button>
          <button>Featured Drives</button>
        </nav>
      </header>

      <main className="flex-1 p-4">
        <div className="h-full w-full rounded-2xl shadow-md bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Map goes here</p>
        </div>
      </main>
    </div>
  );
}

export default App;