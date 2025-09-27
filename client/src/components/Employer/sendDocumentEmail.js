exports.sendDocumentEmail = functions.https.onCall(async (data, context) => {
    const { to, subject, pdfUrl, docId, uid } = data;
    if (!to || !pdfUrl || !docId || !uid) throw new functions.https.HttpsError("invalid-argument", "Missing fields");
  
    await sendEmailViaSendGrid({
      to,
      subject,
      html: `<p>Your FleetTrack ∞ document is ready.</p><p>Document ID: ${docId}</p>`,
      attachments: [{ filename: `${docId}.pdf`, path: pdfUrl }]
    });
  
    await admin.firestore().collection("apps/fleet-track-app/emailLogs").add({
      to,
      uid,
      docId,
      sentAt: new Date().toISOString()
    });
  
    return { status: "sent" };
  });