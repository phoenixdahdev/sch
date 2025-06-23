import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import {
  AuthGuard,
  CurrentUser,
  PaginationValidator,
  User,
} from '@kemuko-org/shared-utils';
import FindRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/find-record-generic';
import { Notification } from '@kemuko-org/db-schemas';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get notifications for current user (all or unread)',
  })
  @ApiQuery({
    name: 'unread',
    required: false,
    type: Boolean,
    description: 'Set to true to fetch only unread notifications',
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() pagination?: PaginationValidator,
    @Query('unread') unread?: string,
  ) {
    const findOption: FindRecordGeneric<Partial<Notification>> = {
      findOptions: {
        user_id: user.id,
        ...(unread === 'true' ? { is_read: false } : {}),
      },
      paginationPayload: {
        page: parseInt(pagination?.page) || 1,
        limit: parseInt(pagination?.limit) || 10,
      },
      order: { issued_at: 'DESC' },
      transactionOptions: {
        useTransaction: false,
      },
    };

    return this.notificationService.findAll(findOption);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get notification by id' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.findOne(id, user.id);
  }

  @Put(':id/mark-read')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.markRead(id, user.id);
  }

  @Put('mark-all-read')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: User) {
    return this.notificationService.markAllRead(user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationService.remove(id, user.id);
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear all notifications' })
  async clearAll(@CurrentUser() user: User) {
    return this.notificationService.clearAll(user.id);
  }
}
