export default function OpsCertPatchViewer({ patches }) {
    return (
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">🧠 OpsCert Patch Viewer</h3>
        <ul className="text-sm space-y-1">
          {patches.map((p, i) => (
            <li key={i} className="border p-2 rounded bg-gray-50">
              ✅ {p.name} — Deployed {new Date(p.timestamp).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>
    );
  }