// FleetMarketButton.jsx
import { useNavigate } from 'react-router-dom'

export default function FleetMarketButton() {
  const navigate = useNavigate()

  return (
    <button
      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded shadow hover:scale-105 transition"
      onClick={() => navigate('/fleetmarket')}
    >
      Enter FleetMarket+
    </button>
  )
}