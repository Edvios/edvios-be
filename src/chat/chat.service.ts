import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole, MessageStatus } from '@prisma/client';
import {
  CreateChatDto,
  SendMessageDto,
  GetMessagesQueryDto,
  UpdateMessageStatusDto,
} from './dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a student record exists
   */
  async checkStudentExists(studentId: string): Promise<boolean> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    return !!student;
  }

  /**
   * Check if an agent record exists
   */
  async checkAgentExists(agentId: string): Promise<boolean> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    return !!agent;
  }

  /**
   * Create a new chat between a student and an agent
   */
  async createChat(createChatDto: CreateChatDto) {
    const { studentId, agentId } = createChatDto;

    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if agent exists
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Create or return existing chat
    const chat = await this.prisma.chat.upsert({
      where: {
        studentId_agentId: { studentId, agentId },
      },
      update: {},
      create: {
        studentId,
        agentId,
      },
      include: {
        student: {
          include: { user: true },
        },
        agent: {
          include: { user: true },
        },
      },
    });

    return chat;
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        student: {
          include: { user: true },
        },
        agent: {
          include: { user: true },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify user is part of this chat
    if (chat.studentId !== userId && chat.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    return chat;
  }

  /**
   * Get all chats for a user (student or agent)
   */
  async getUserChats(userId: string, userRole?: UserRole) {
    // Check both columns to handle cases where role might be ambiguous in token
    const whereClause = {
      OR: [{ studentId: userId }, { agentId: userId }],
    };

    console.log(
      `Getting chats for user ${userId} with role ${userRole || 'undefined'}`,
    );

    const chats = await this.prisma.chat.findMany({
      where: whereClause,
      include: {
        student: {
          include: { user: true },
        },
        agent: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get only the last message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Add unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            status: { not: MessageStatus.READ },
          },
        });
        return { ...chat, unreadCount };
      }),
    );

    return chatsWithUnreadCount;
  }

  /**
   * Send a message in a chat
   */
  async sendMessage(
    userId: string,
    userRole: UserRole | undefined,
    sendMessageDto: SendMessageDto,
  ) {
    const {
      chatId,
      content,
      attachmentUrl,
      attachmentType,
      attachmentName,
      attachmentSize,
    } = sendMessageDto;

    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify user is part of this chat
    if (chat.studentId !== userId && chat.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    // Determine sender role based on chat relationship if not provided
    const actualSenderRole =
      userRole ||
      (chat.studentId === userId ? UserRole.STUDENT : UserRole.AGENT);

    // Create the message
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: userId,
        senderRole: actualSenderRole,
        content: content || '', // Ensure content is string even if empty
        attachmentUrl,
        attachmentType,
        attachmentName,
        attachmentSize,
        status: MessageStatus.SENT,
      },
    });

    // Update chat's updatedAt timestamp
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Get messages for a chat with pagination
   */
  async getMessages(
    chatId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ) {
    const { page = 1, size = 50, before } = query;

    // Verify chat exists and user has access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    console.log('getMessages auth check:', {
      chatId,
      userId,
      chatStudentId: chat.studentId,
      chatAgentId: chat.agentId,
      isStudent: chat.studentId === userId,
      isAgent: chat.agentId === userId,
    });

    if (chat.studentId !== userId && chat.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    const skip = (Number(page) - 1) * Number(size);
    const take = Number(size);

    const whereClause: { chatId: string; createdAt?: { lt: Date } } = {
      chatId,
    };
    if (before) {
      const beforeMessage = await this.prisma.chatMessage.findUnique({
        where: { id: before },
      });
      if (beforeMessage) {
        whereClause.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.chatMessage.count({ where: { chatId } }),
    ]);

    return {
      messages,
      total,
      page,
      size,
      hasMore: skip + messages.length < total,
    };
  }

  /**
   * Update message status (mark as delivered or read)
   */
  async updateMessageStatus(userId: string, updateDto: UpdateMessageStatusDto) {
    const { messageIds, status } = updateDto;

    // Verify messages exist and user is the recipient
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        id: { in: messageIds },
        senderId: { not: userId }, // User can only update status of messages they received
      },
    });

    if (messages.length === 0) {
      return { updated: 0 };
    }

    const result = await this.prisma.chatMessage.updateMany({
      where: {
        id: { in: messages.map((m) => m.id) },
      },
      data: { status },
    });

    return { updated: result.count };
  }

  /**
   * Get or create chat between student and agent
   */
  async getOrCreateChat(studentId: string, agentId: string) {
    return this.createChat({ studentId, agentId });
  }

  /**
   * Get assigned agent for a student (or assign one if not exists)
   * For simplicity, assigns the first available agent
   */
  async getAssignedAgent(studentId: string) {
    // Check if student already has a chat with an agent
    const existingChat = await this.prisma.chat.findFirst({
      where: { studentId },
      include: {
        agent: {
          include: { user: true },
        },
      },
    });

    if (existingChat) {
      return existingChat.agent;
    }

    // Find an available agent (simple round-robin - get agent with least chats)
    const agentWithLeastChats = await this.prisma.agent.findFirst({
      include: {
        user: true,
        _count: { select: { chats: true } },
      },
      orderBy: {
        chats: { _count: 'asc' },
      },
    });

    return agentWithLeastChats;
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [{ studentId: userId }, { agentId: userId }],
      },
      select: { id: true },
    });

    const chatIds = chats.map((c) => c.id);

    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        chatId: { in: chatIds },
        senderId: { not: userId },
        status: { not: MessageStatus.READ },
      },
    });

    return { unreadCount };
  }
}
