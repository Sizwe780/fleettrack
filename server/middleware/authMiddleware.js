/**
 * Role-based access control middleware
 * Usage: app.use('/api/secure', authorizeRoles('admin', 'driver'))
 */

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.headers['x-user-role'];
  
      if (!userRole) {
        return res.status(401).json({ error: 'Unauthorized: No role provided' });
      }
  
      if (!allowedRoles.includes(userRole)) {
        console.warn(`[RBAC] Access denied for role: ${userRole} → Required: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ error: 'Access denied: insufficient role' });
      }
  
      next();
    };
  }
  
  module.exports = { authorizeRoles };