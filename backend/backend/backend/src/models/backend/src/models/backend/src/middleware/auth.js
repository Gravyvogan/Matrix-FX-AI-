const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Extract token from the incoming HTTP request headers
  const token = req.header('Authorization')?.split(' ')[1] || req.header('x-auth-token');

  // Check if token does not exist
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No security token provided." });
  }

  try {
    // Verify token validity against your private server key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    
    // Attach the verified user details to the request object
    req.user = decoded;
    next(); // Pass control to the next route controller
  } catch (err) {
    res.status(401).json({ message: "Access Denied: Security token is invalid or expired." });
  }
};
