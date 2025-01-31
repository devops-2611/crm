const jwt = require("jsonwebtoken");
const User = require("../Models/user");

const auth = async (req, res, next) => {
  try {
    
    // Check for Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Authorization header missing or malformed" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    // Fetch user and attach to req
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.user = user;
    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.error("Error in auth middleware:", err.message);
    return res.status(401).json({ msg: "Token validation failed" });
  }
};

module.exports = auth;
