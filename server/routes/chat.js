import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user chats
router.get('/userchats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB();

    const userChats = await db.collection('userchats').findOne({ userId });
    res.json(userChats || { userId, chats: [] });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

// Update user chats
router.put('/userchats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { chats } = req.body;
    const db = getDB();

    await db.collection('userchats').updateOne(
      { userId },
      { $set: { chats } },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update chats error:', error);
    res.status(500).json({ error: 'Failed to update chats' });
  }
});

// Get or create chat between two users
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { firstUserId, secondUserId } = req.body;
    const db = getDB();

    // Check if chat already exists
    const existingChat = await db.collection('chats').findOne({
      members: { $all: [firstUserId, secondUserId] }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const chat = {
      members: [firstUserId, secondUserId],
      messages: [],
      createdAt: new Date()
    };

    const result = await db.collection('chats').insertOne(chat);
    res.status(201).json({ ...chat, _id: result.insertedId });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get chat by ID
router.get('/chat/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getDB();

    if (!ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: 'Invalid chat ID format' });
    }

    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// Add message to chat
router.post('/chat/:chatId/message', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, senderId, img } = req.body;
    const db = getDB();

    if (!ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: 'Invalid chat ID format' });
    }

    // Get the chat to find the receiver
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const receiverId = chat.members.find(m => m !== senderId);

    const message = {
      text,
      senderId,
      img: img || null,
      createdAt: new Date()
    };

    await db.collection('chats').updateOne(
      { _id: new ObjectId(chatId) },
      { $push: { messages: message } }
    );

    // Update receiver's userchats with unreadCount
    if (receiverId) {
      await db.collection('userchats').updateOne(
        { userId: receiverId, "chats.chatId": chatId },
        { 
          $inc: { "chats.$.unreadCount": 1 },
          $set: { "chats.$.lastMessage": text }
        }
      );
    }

    res.json(message);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get messages between two users
router.get('/messages/:userId/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const db = getDB();

    const chat = await db.collection('chats').findOne({
      members: { $all: [userId, otherUserId] }
    });

    res.json(chat ? chat.messages : []);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
