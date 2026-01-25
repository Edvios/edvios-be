import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateChatDto,
  GetMessagesQueryDto,
  UpdateMessageStatusDto,
} from './dto';

// Local interface matching ChatUser to avoid decorator metadata issues
interface ChatUser {
  userId: string;
  email: string;
  role?: UserRole;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Create a new chat between student and agent
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(createChatDto);
  }

  /**
   * Get all chats for the current user
   */
  @Get()
  async getUserChats(@CurrentUser() user: ChatUser) {
    console.log('GET /chat - user:', user);
    return this.chatService.getUserChats(user.userId, user.role);
  }

  /**
   * Get unread message count
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: ChatUser) {
    return this.chatService.getUnreadCount(user.userId);
  }

  /**
   * Get assigned agent for student (or get/create chat)
   */
  @Get('assigned-agent')
  @UseGuards(RoleGuard)
  @Roles(UserRole.STUDENT)
  async getAssignedAgent(@CurrentUser() user: ChatUser) {
    return this.chatService.getAssignedAgent(user.userId);
  }

  /**
   * Get or create chat with assigned agent (for students)
   */
  @Post('start')
  @UseGuards(RoleGuard)
  @Roles(UserRole.STUDENT)
  async startChat(@CurrentUser() user: ChatUser) {
    // First check if student record exists
    const studentExists = await this.chatService.checkStudentExists(
      user.userId,
    );
    if (!studentExists) {
      return {
        error: 'Student profile not found. Please complete your profile first.',
        chat: null,
        agent: null,
      };
    }

    const agent = await this.chatService.getAssignedAgent(user.userId);
    if (!agent) {
      return {
        error: 'No agents available at the moment. Please try again later.',
        chat: null,
        agent: null,
      };
    }
    const chat = await this.chatService.getOrCreateChat(user.userId, agent.id);
    return { chat, agent };
  }

  /**
   * Get a specific chat by ID
   */
  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
    @CurrentUser() user: ChatUser,
  ) {
    return this.chatService.getChatById(chatId, user.userId);
  }

  /**
   * Get messages for a chat
   */
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @CurrentUser() user: ChatUser,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.chatService.getMessages(chatId, user.userId, query);
  }

  /**
   * Send a message in a chat
   */
  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @CurrentUser() user: ChatUser,
    @Body()
    body: {
      content?: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
      attachmentSize?: number;
    },
  ) {
    return this.chatService.sendMessage(user.userId, user.role, {
      chatId,
      ...body,
    });
  }

  /**
   * Update message status (mark as read/delivered)
   */
  @Patch('messages/status')
  async updateMessageStatus(
    @CurrentUser() user: ChatUser,
    @Body() updateDto: UpdateMessageStatusDto,
  ) {
    return this.chatService.updateMessageStatus(user.userId, updateDto);
  }
}
