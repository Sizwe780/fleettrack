import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()
const users = []

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  users.push({ email, password: hashed })
  res.status(201).send('Registered')
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials')
  }
  const token = jwt.sign({ email }, 'secret')
  res.json({ token })
})

export default router