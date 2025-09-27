export function listStudentOffer({ userId, type, origin, destination, price, seats }) {
    return {
      offerId: `MP-${userId}-${Date.now()}`,
      type, // "ride", "delivery", "service"
      origin,
      destination,
      price,
      seats,
      status: "active",
      timestamp: Date.now()
    };
  }
  
  export function matchStudentRequest({ offers, request }) {
    return offers.filter(o =>
      o.type === request.type &&
      o.origin === request.origin &&
      o.destination === request.destination &&
      o.seats >= request.seats &&
      o.status === "active"
    );
  }