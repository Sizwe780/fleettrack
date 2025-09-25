export default function ExportButton({ label }) {
    return (
      <button className="px-4 py-2 bg-platinum text-darkBlue rounded hover:bg-emerald transition">
        {label}
      </button>
    );
  }