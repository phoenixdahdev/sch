import { UserCourse } from './user_course.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('certificates')
@Unique(['user_course_id'])
export class Certificate extends AbstractBaseEntity {
  @ManyToOne(() => UserCourse)
  @JoinColumn({ name: 'user_course_id' })
  user_course: UserCourse;

  @Column({ name: 'user_course_id' })
  user_course_id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'course_id' })
  course_id: string;

  @Column({ name: 'course_name', nullable: true })
  course_name: string;

  @Column({ name: 'user_name', nullable: true })
  user_name: string;

  @Column({ name: 'certificate_url', nullable: true })
  certificate_url: string;

  @Column({ name: 'verification_code', nullable: true })
  verification_code: string;

  @Column({
    name: 'issued_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  issued_at: Date;

  @Column({ name: 'expires_at', nullable: true })
  expires_at: Date;

  @Column({ name: 'is_valid', default: true })
  is_valid: boolean;
}
