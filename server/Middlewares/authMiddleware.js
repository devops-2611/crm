const jwt = require('jsonwebtoken');
const User = require('../Models/user');

const auth = async (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract the token by replacing 'Bearer ' from the Authorization header
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by decoded ID and exclude the password
    req.user = await User.findById(decoded.id).select('-password');
    
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
