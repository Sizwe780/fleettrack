import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CargoQR = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    });

    scanner.render(
      (decodedText) => {
        if (decodedText) {
          onScan({
            type: 'cargo-scan',
            payload: { cargoId: decodedText },
            timestamp: new Date().toISOString(),
          });
        }
      },
      (errorMessage) => {
        console.warn('QR scan error:', errorMessage);
      }
    );

    return () => {
      scanner.clear().catch((err) => {
        console.error('Scanner cleanup failed:', err);
      });
    };
  }, [onScan]);

  return <div id="qr-reader" style={{ width: '100%' }} />;
};

export default CargoQR;