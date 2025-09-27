import express from 'express'
const router = express.Router()
const history = {}

router.post('/log', (req, res) => {
  const { userId, productId } = req.body
  if (!history[userId]) history[userId] = []
  history[userId].push(productId)
  res.send('Logged')
})

router.get('/suggest/:userId', (req, res) => {
  const userId = req.params.userId
  const recent = history[userId] || []
  const suggestions = recent.length ? ['Fatigue Index', 'Geo-Fence Tester'] : ['Starter Sim Pack']
  res.json({ suggestions })
})

export default router