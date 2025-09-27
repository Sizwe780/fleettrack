import express from 'express'
const router = express.Router()

router.post('/pay', (req, res) => {
  const { productId, userId } = req.body
  res.send(`Payment successful for product ${productId} by user ${userId}`)
})

export default router