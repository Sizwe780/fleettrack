// RBAC middleware for role-based access control
function requireRole(...allowedRoles) {
    return (req, res, next) => {
      const user = req.user; // Assumes user is attached via auth middleware
  
      if (!user || !user.role) {
        return res.status(401).json({ error: 'Unauthorized: No role found' });
      }
  
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Access denied for role: ${user.role}` });
      }
  
      next();
    };
  }
  
  module.exports = { requireRole };