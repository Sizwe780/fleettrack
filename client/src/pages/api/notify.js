import { sendPushNotification } from '../../lib/sendPushNotification';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  await sendPushNotification(token, title, body);
  res.status(200).json({ success: true });
}