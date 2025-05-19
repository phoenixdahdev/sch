import { Course } from './course.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('reviews')
@Unique(['user_id', 'course_id'])
export class Review extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'user_name', nullable: true })
  user_name: string;

  @ManyToOne(() => Course, (course) => course.reviews)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  course_id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @Column({ name: 'is_verified', default: false })
  is_verified: boolean;
}
