export default function BadgeWall({ badges }) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
        <h3 className="text-lg font-bold mb-2">Your Badges</h3>
        <div className="flex gap-2 flex-wrap">
          {badges.map((b, i) => (
            <span key={i} className="px-2 py-1 bg-yellow-400 text-black rounded">{b}</span>
          ))}
        </div>
      </div>
    )
  }