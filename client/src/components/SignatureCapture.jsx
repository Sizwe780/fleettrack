import React, { useRef, useState } from 'react';

const SignatureCapture = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [preview, setPreview] = useState(null);

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
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

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPreview(null);
  };

  const saveSignature = () => {
    const dataURL = canvasRef.current.toDataURL();
    setPreview(dataURL);
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
      <div className="mt-2 flex gap-2">
        <button
          onClick={saveSignature}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Save Signature
        </button>
        <button
          onClick={clearCanvas}
          className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
        >
          Clear
        </button>
      </div>
      {preview && (
        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-1">✅ Signature saved:</p>
          <img src={preview} alt="Signature preview" className="border rounded" />
        </div>
      )}
    </div>
  );
};

export default SignatureCapture;