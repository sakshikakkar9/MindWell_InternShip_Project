import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Ensure JWT_SECRET is set in Render Dashboard -> Environment Variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Log the error on Render's console so you can see why it failed (expired vs wrong secret)
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default auth;