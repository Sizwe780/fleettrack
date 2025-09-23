import React from 'react';

const TripSignatureBlock = ({ driverName }) => (
  <div className="mt-6 text-sm border-t pt-4">
    <p>Driver: <strong>{driverName}</strong></p>
    <p>Signature: ____________________________</p>
    <p>Date: _________________________________</p>
  </div>
);

export default TripSignatureBlock;