import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    const db = getDB();

    // Check if already friends
    const existingChats = await db.collection('userchats').findOne({ userId: fromUserId });
    const isAlreadyFriend = (existingChats?.chats || []).some(c => c.receiverId === toUserId);
    if (isAlreadyFriend) {
      return res.status(400).json({ error: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = await db.collection('friendrequests').findOne({
      fromUserId,
      toUserId,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    // Create friend request
    const request = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date()
    };

    await db.collection('friendrequests').insertOne(request);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get incoming friend requests
router.get('/requests/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();

    const requests = await db.collection('friendrequests').find({
      toUserId: userId,
      status: 'pending'
    }).toArray();

    // Get user info for each request
    const requestsWithUsers = await Promise.all(requests.map(async (req) => {
      const user = await db.collection('users').findOne({ _id: new ObjectId(req.fromUserId) });
      return {
        ...req,
        fromUser: user ? {
          id: user._id.toString(),
          username: user.username,
          avatar: user.avatar
        } : null
      };
    }));

    res.json(requestsWithUsers);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Accept friend request
router.post('/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const db = getDB();

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID format' });
    }

    const request = await db.collection('friendrequests').findOne({ _id: new ObjectId(requestId) });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request status
    await db.collection('friendrequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: 'accepted' } }
    );

    // Create chat for both users
    const chat = await db.collection('chats').insertOne({
      members: [request.fromUserId, request.toUserId],
      messages: [],
      createdAt: new Date()
    });

    const chatId = chat.insertedId.toString();

    // Add chat to both users' chat lists
    const updateUserChat = async (userId, receiverId) => {
      const userChats = await db.collection('userchats').findOne({ userId });
      if (userChats) {
        await db.collection('userchats').updateOne(
          { userId },
          { $push: { chats: { chatId, receiverId, lastMessage: '', updatedAt: Date.now() } } }
        );
      } else {
        await db.collection('userchats').insertOne({
          userId,
          chats: [{ chatId, receiverId, lastMessage: '', updatedAt: Date.now() }]
        });
      }
    };

    await updateUserChat(request.fromUserId, request.toUserId);
    await updateUserChat(request.toUserId, request.fromUserId);

    res.json({ success: true, chatId });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// Reject friend request
router.post('/reject', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    const db = getDB();

    if (!ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID format' });
    }

    await db.collection('friendrequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status: 'rejected' } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

export default router;
