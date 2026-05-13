import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user info
router.get('/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const db = getDB();

    // Validate ObjectId format
    if (!ObjectId.isValid(uid)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(uid) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      blocked: user.blocked || []
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { username, avatar } = req.body;
    const db = getDB();

    // Validate ObjectId format
    if (!ObjectId.isValid(uid)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;

    await db.collection('users').updateOne(
      { _id: new ObjectId(uid) },
      { $set: updateData }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get all users (for chat list)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find().toArray();
    
    res.json(users.map(u => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      avatar: u.avatar
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
