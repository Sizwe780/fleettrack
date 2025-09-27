import express from 'express'
const router = express.Router()
const credits = {} // userId → credit count

router.post('/earn', (req, res) => {
  const { userId, amount } = req.body
  credits[userId] = (credits[userId] || 0) + amount
  res.send('Credits earned')
})

router.post('/spend', (req, res) => {
  const { userId, amount } = req.body
  if ((credits[userId] || 0) < amount) return res.status(400).send('Insufficient credits')
  credits[userId] -= amount
  res.send('Credits spent')
})

router.get('/balance/:userId', (req, res) => {
  res.json({ credits: credits[req.params.userId] || 0 })
})

export default router