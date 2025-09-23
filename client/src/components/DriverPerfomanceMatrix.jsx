export default function DriverPerformanceMatrix({ drivers }) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md mt-6">
        <h3 className="text-lg font-bold mb-2">🏁 Driver Performance Matrix</h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Name</th><th>Health</th><th>Profit</th><th>Violations</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => (
              <tr key={i} className="border-t">
                <td>{d.name}</td>
                <td>{d.avgHealthScore}</td>
                <td>R{d.totalProfit}</td>
                <td>{d.violations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }