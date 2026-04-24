import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Check for the Authorization header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'mindwell_secret_key_123';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' }); // This is the error in your image
  }
};

export default auth;