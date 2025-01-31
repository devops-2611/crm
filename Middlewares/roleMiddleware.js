const roleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
      const userRoles = req.user.roles;
  
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRequiredRole) {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;
  