import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(@Request() req) {
    return this.notificationService.findAll(req.user.id);
  }

  @Get('unread')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get unread notifications for current user' })
  async findUnread(@Request() req) {
    return this.notificationService.findUnread(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get notification by id' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.notificationService.findOne(id, req.user.id);
  }

  @Put(':id/mark-read')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markRead(id, req.user.id);
  }

  @Put('mark-all-read')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Request() req) {
    return this.notificationService.markAllRead(req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.notificationService.remove(id, req.user.id);
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearAll(@Request() req) {
    return this.notificationService.clearAll(req.user.id);
  }
}
