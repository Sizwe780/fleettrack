import React, { useRef, useState } from 'react';

const SignatureCapture = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const saveSignature = () => {
    const dataURL = canvasRef.current.toDataURL();
    onSave?.(dataURL);
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-1">✍️ Driver Signature</h3>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="border rounded bg-white"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
      />
      <button
        onClick={saveSignature}
        className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
      >
        Save Signature
      </button>
    </div>
  );
};

export default SignatureCapture;