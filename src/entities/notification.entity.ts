import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('notifications')
export class Notification extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @Column()
  type: string; // course-update, assessment-feedback, etc.

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true, type: 'json' })
  metadata: object;
}
