import { useEffect, useState } from 'react'

export default function SmartFeed({ userId }) {
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    fetch(`/api/recommend/${userId}`)
      .then(res => res.json())
      .then(data => setSuggestions(data.suggestions))
  }, [userId])

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h3 className="text-lg font-bold mb-2">Recommended for You</h3>
      <ul className="list-disc pl-4">
        {suggestions.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  )
}