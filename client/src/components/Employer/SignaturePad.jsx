import ReactSignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ onSave }) {
  const sigRef = useRef();

  const handleSave = () => {
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="mb-4">
      <ReactSignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{ width: 400, height: 150, className: "border border-gray-300 rounded" }}
      />
      <button onClick={handleSave} className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded">
        Save Signature
      </button>
    </div>
  );
}