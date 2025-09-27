import ModuleCard from './ModuleCard'
import { useEffect, useState } from 'react'

export default function FleetMarket() {
  const [modules, setModules] = useState([])

  useEffect(() => {
    fetch('/api/marketplace/browse')
      .then(res => res.json())
      .then(setModules)
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">FleetMarket+ Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map(m => (
          <ModuleCard key={m.id} title={m.title} price={m.price} />
        ))}
      </div>
    </div>
  )
}