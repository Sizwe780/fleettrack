// wellness.js
import express from 'express'
const router = express.Router()
const wellnessData = {} // userId → { fatigue, stress }

router.post('/track', (req, res) => {
  const { userId, fatigue, stress } = req.body
  wellnessData[userId] = { fatigue, stress }
  res.send('Wellness tracked')
})

router.get('/status/:userId', (req, res) => {
  const data = wellnessData[req.params.userId]
  if (!data) return res.send('No data')
  const risk = data.fatigue > 70 || data.stress > 60 ? 'High' : 'Normal'
  res.json({ ...data, risk })
})

export default router