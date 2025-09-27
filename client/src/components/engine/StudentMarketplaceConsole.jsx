import React, { useState } from 'react';
import { listStudentOffer, matchStudentRequest } from '../engines/MarketplaceEngine';

export default function StudentMarketplaceConsole({ userId }) {
  const [offers, setOffers] = useState([]);
  const [matches, setMatches] = useState([]);

  const newOffer = listStudentOffer({
    userId,
    type: "ride",
    origin: "Campus A",
    destination: "Campus B",
    price: 30,
    seats: 3
  });

  const request = { type: "ride", origin: "Campus A", destination: "Campus B", seats: 1 };
  const foundMatches = matchStudentRequest([...offers, newOffer], request);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-indigo-700 mb-2">🎓 Student Marketplace</h3>
      <p className="text-sm text-gray-700 mb-2">New Offer ID: <strong>{newOffer.offerId}</strong></p>
      <p className="text-sm text-gray-700 mb-2">Matching Requests:</p>
      <ul className="list-disc ml-4 text-sm text-gray-700">
        {foundMatches.map((m, i) => (
          <li key={i}>{m.origin} → {m.destination} | R{m.price} | Seats: {m.seats}</li>
        ))}
      </ul>
    </section>
  );
}