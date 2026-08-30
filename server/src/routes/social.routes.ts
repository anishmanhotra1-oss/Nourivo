import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Search users by name or email
router.get('/users/search', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const query = String(req.query.q || '').trim();

    if (!query) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 20,
    });

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId },
          { friendId: currentUserId },
        ],
      },
    });

    const results = users.map((u) => {
      const friendship = friendships.find(
        (f) => (f.userId === currentUserId && f.friendId === u.id) || (f.friendId === currentUserId && f.userId === u.id)
      );

      let status = 'NONE';
      let friendshipId = null;

      if (friendship) {
        friendshipId = friendship.id;
        if (friendship.status === 'ACCEPTED') {
          status = 'ACCEPTED';
        } else if (friendship.userId === currentUserId) {
          status = 'SENT_PENDING';
        } else {
          status = 'RECEIVED_PENDING';
        }
      }

      return {
        ...u,
        friendshipStatus: status,
        friendshipId,
      };
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// List confirmed friends & incoming pending requests
router.get('/friends', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId },
          { friendId: currentUserId },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        friend: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const confirmedFriends: any[] = [];
    const pendingIncomingRequests: any[] = [];

    friendships.forEach((f) => {
      const isSender = f.userId === currentUserId;
      const targetUser = isSender ? f.friend : f.user;

      if (f.status === 'ACCEPTED') {
        confirmedFriends.push({
          friendshipId: f.id,
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          createdAt: f.createdAt,
        });
      } else if (!isSender && f.status === 'PENDING') {
        pendingIncomingRequests.push({
          friendshipId: f.id,
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          createdAt: f.createdAt,
        });
      }
    });

    res.json({
      friends: confirmedFriends,
      pendingRequests: pendingIncomingRequests,
    });
  } catch (error) {
    next(error);
  }
});

// Send friend request
router.post('/friends/request', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Invalid target user' });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: targetUserId },
          { userId: targetUserId, friendId: currentUserId },
        ],
      },
    });

    if (existing) {
      return res.json(existing);
    }

    const newFriendship = await prisma.friendship.create({
      data: {
        userId: currentUserId,
        friendId: targetUserId,
        status: 'PENDING',
      },
    });

    res.json(newFriendship);
  } catch (error) {
    next(error);
  }
});

// Accept friend request
router.post('/friends/accept', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const { friendshipId } = req.body;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.friendId !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Remove / reject friendship
router.post('/friends/remove', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const { friendshipId } = req.body;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || (friendship.userId !== currentUserId && friendship.friendId !== currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to modify this friendship' });
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    res.json({ message: 'Friendship removed successfully' });
  } catch (error) {
    next(error);
  }
});

// Get chat messages (receiverId="global" or friend ID)
router.get('/chat/messages', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const targetReceiverId = String(req.query.receiverId || 'global');

    let messages;

    if (targetReceiverId === 'global') {
      messages = await prisma.chatMessage.findMany({
        where: { receiverId: null },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
    } else {
      messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetReceiverId },
            { senderId: targetReceiverId, receiverId: currentUserId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
    }

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Send chat message (saved permanently)
router.post('/chat/send', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const currentUserId = req.userId!;
    const { receiverId, content } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: currentUserId,
        receiverId: receiverId === 'global' ? null : receiverId,
        content: String(content).trim(),
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(message);
  } catch (error) {
    next(error);
  }
});

export default router;
