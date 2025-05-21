import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '@entities/notification.entity';
import { NotificationModelAction } from '../../actions/model-actions';
import FindRecordGeneric from '@kemuko-org/shared-utils/dist/database/options/find-record-generic';
import { buildResponse } from '@kemuko-org/shared-utils';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationModelAction: NotificationModelAction,
  ) {}

  async findAll(findOptions: FindRecordGeneric<Partial<Notification>>) {
    const notifications = await this.notificationModelAction.find(findOptions);
    return {
      data: { notifications: notifications.payload },
      message: 'Notifications retrieved successfully',
      meta: notifications.paginationMeta,
    };
  }

  // async findUnread(userId: string): Promise<Notification[]> {
  //     return this.notificationRepository.find({
  //         where: { user_id: userId, is_read: false },
  //         order: { created_at: 'DESC' },
  //     });
  // }

  async findOne(id: string, userId: string) {
    const notification = await this.notificationModelAction.get({
      id,
      user_id: userId,
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return buildResponse(
      { notification },
      'Notification retrieved successfully',
    );
  }

  async markRead(id: string, userId: string) {
    const notification = await this.findOne(id, userId);
    await this.notificationModelAction.update({
      updatePayload: {
        is_read: true,
      },
      identifierOptions: {
        id: notification.data.notification.id,
        user_id: userId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse(
      { notification: (await this.findOne(id, userId)).data.notification },
      'Notification marked as read',
    );
  }

  async markAllRead(userId: string) {
    await this.notificationModelAction.update({
      updatePayload: {
        is_read: true,
      },
      identifierOptions: {
        user_id: userId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'All notifications marked as read');
  }

  async remove(id: string, userId: string) {
    await this.notificationModelAction.delete({
      identifierOptions: {
        id,
        user_id: userId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'Notification deleted successfully');
  }

  async clearAll(userId: string) {
    await this.notificationModelAction.delete({
      identifierOptions: {
        user_id: userId,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({}, 'All notifications cleared successfully');
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ) {
    const notification = await this.notificationModelAction.create({
      createPayload: {
        user_id: userId,
        type,
        title,
        message,
        link,
        metadata,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return buildResponse({ notification }, 'Notification created successfully');
  }
}
