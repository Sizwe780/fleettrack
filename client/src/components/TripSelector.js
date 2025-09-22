const TripSelector = ({ trips, onSelect }) => {
    const handleChange = (e) => {
      const selectedIds = Array.from(e.target.selectedOptions).map(opt => opt.value);
      const selected = trips.filter(t => selectedIds.includes(t.id));
      onSelect(selected);
    };
  
    return (
      <div>
        <label className="block font-semibold mb-2">Select Trips to Compare:</label>
        <select multiple onChange={handleChange} className="w-full p-2 border rounded-md h-40">
          {trips.map(trip => (
            <option key={trip.id} value={trip.id}>
              {trip.driver_name} — {trip.origin} → {trip.destination} ({trip.date})
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export default TripSelector;