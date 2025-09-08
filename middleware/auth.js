import jwt from 'jsonwebtoken';
import { connectDB } from '../../lib/db';
import User from '../../models/User';

export const authenticate = (handler) => async (req, res) => {
  await connectDB();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    return handler(req, res);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};