const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log("Received Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No Bearer token found");
    return res.status(401).json({ message: 'Unauthorized - No Token' });
  }

  const token = authHeader.split(' ')[1];
  console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); 

    if (!decoded || !decoded.id) {
      console.log("Token is invalid or malformed");
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    req.admin = decoded;
    next(); 
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
