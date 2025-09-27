import express from 'express'
const router = express.Router()
let products = []

router.post('/list', (req, res) => {
  const { title, price, creator } = req.body
  products.push({ id: Date.now(), title, price, creator, ratings: [] })
  res.status(201).send('Product listed')
})

router.get('/browse', (req, res) => {
  res.json(products)
})

router.post('/rate', (req, res) => {
  const { productId, rating } = req.body
  const product = products.find(p => p.id === productId)
  if (product) product.ratings.push(rating)
  res.send('Rated')
})

export default router