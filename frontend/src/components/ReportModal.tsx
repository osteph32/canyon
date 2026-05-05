type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: string) => void;
};

const reportTypes = [
  { label: "Police", emoji: "🚔" },
  { label: "Accident", emoji: "💥" },
  { label: "Traffic", emoji: "🚗" },
  { label: "Hazard", emoji: "⚠️" },
];

function ReportModal({
  isOpen,
  onClose,
  onSelect,
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          Report Incident
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {reportTypes.map((report) => (
            <button
              key={report.label}
              onClick={() => onSelect(report.label.toLowerCase())}
              className="p-4 rounded-xl border hover:bg-gray-50 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{report.emoji}</span>
              <span>{report.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ReportModal;