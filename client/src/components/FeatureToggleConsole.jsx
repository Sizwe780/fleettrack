export default function FeatureToggleConsole({ toggles, updateToggle }) {
    return (
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h3 className="text-lg font-bold mb-2">🧩 Feature Toggles</h3>
        {Object.entries(toggles).map(([feature, enabled]) => (
          <div key={feature} className="flex justify-between items-center mb-2">
            <span>{feature}</span>
            <button
              onClick={() => updateToggle(feature, !enabled)}
              className={`px-3 py-1 rounded ${enabled ? 'bg-green-600' : 'bg-red-600'} text-white`}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    );
  }