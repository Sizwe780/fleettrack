import express from 'express'
const router = express.Router()
const badges = {} // userId → [badge names]

router.post('/award', (req, res) => {
  const { userId, badge } = req.body
  if (!badges[userId]) badges[userId] = []
  badges[userId].push(badge)
  res.send('Badge awarded')
})

router.get('/list/:userId', (req, res) => {
  res.json({ badges: badges[req.params.userId] || [] })
})

export default router