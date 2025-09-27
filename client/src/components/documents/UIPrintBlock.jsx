{document && (
    <div className="print-preview">
      <img src={document.logoUrl} alt="FleetTrack ∞ Logo" className="h-12 mb-4" />
      <h2 className="text-xl font-bold">Document ID: {document.docId}</h2>
      <p className="text-sm text-gray-600">Generated: {document.createdAt}</p>
      <pre className="bg-gray-100 p-4 rounded-lg">{JSON.stringify(document.content, null, 2)}</pre>
    </div>
  )}