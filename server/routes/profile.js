router.get('/profile', authorizeRoles('driver', 'admin'), (req, res) => {
    const mockUser = {
      name: 'Sizwe Ngwenya',
      email: 'sizwe@fleettrack.africa',
      role: 'admin',
      createdAt: '2025-08-01T10:00:00Z'
    };
  
    res.json(mockUser);
  });