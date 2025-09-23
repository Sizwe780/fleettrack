const express = require('express');
const router = express.Router();

let users = [
  { id: 'u001', name: 'Sizwe Ngwenya', email: 'sizwe@fleettrack.africa', role: 'admin' },
  { id: 'u002', name: 'Thabo Mokoena', email: 'thabo@fleettrack.africa', role: 'driver' },
  { id: 'u003', name: 'Lerato Dlamini', email: 'lerato@fleettrack.africa', role: 'viewer' }
];

router.get('/', (req, res) => {
  res.json(users);
});

router.patch('/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users[index].role = role;
  res.json({ message: 'Role updated', user: users[index] });
});

module.exports = router;