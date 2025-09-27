import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CargoQR = ({ onScan }) => {
  useEffect(() => {
    if (!onScan || typeof onScan !== 'function') {
      console.warn('CargoQR: onScan callback is missing or invalid.');
      return;
    }

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    const successCallback = (decodedText) => {
      onScan({
        type: 'cargo-scan',
        payload: { cargoId: decodedText },
        timestamp: new Date().toISOString(),
      });
    };

    const errorCallback = (errorMessage) => {
      console.warn('QR scan error:', errorMessage);
    };

    scanner.render(successCallback, errorCallback);

    return () => {
      scanner.clear().catch((err) => {
        console.error('Scanner cleanup failed:', err);
      });
    };
  }, [onScan]);

  return <div id="qr-reader" style={{ width: '100%', height: '300px' }} />;
};

export default CargoQR;