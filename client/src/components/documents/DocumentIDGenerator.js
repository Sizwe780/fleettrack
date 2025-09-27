export const generateUniqueDocId = async () => {
    const ref = collection(db, "apps/fleet-track-app/documents");
    const snapshot = await getDocs(ref);
    const count = snapshot.size;
    const padded = String(count + 1).padStart(6, "0");
    return `FT-${padded}`;
  };