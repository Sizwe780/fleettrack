import { useState } from 'react'

export default function CreatorConsole() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = async () => {
    await fetch('/api/marketplace/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, creator: 'student@example.com' })
    })
    alert('Module listed!')
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Publish a Module</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Module Title" className="block mb-2 p-2 border rounded" />
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (R)" className="block mb-2 p-2 border rounded" />
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">List Module</button>
    </div>
  )
}