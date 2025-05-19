import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserCourse } from './user_course.entity';
import { Lesson } from './lesson.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('user_progresses')
@Unique(['user_course_id', 'lesson_id'])
export class UserProgress extends AbstractBaseEntity {
  @ManyToOne(() => UserCourse, (user_course) => user_course.progresses)
  @JoinColumn({ name: 'user_course_id' })
  user_course: UserCourse;

  @Column({ name: 'user_course_id' })
  user_course_id: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.user_progresses)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'lesson_id' })
  lesson_id: string;

  @Column({ name: 'watch_time_in_seconds', default: 0 })
  watch_time_in_seconds: number;

  @Column({ name: 'is_completed', default: false })
  is_completed: boolean;

  @Column({ name: 'completed_at', nullable: true })
  completed_at: Date;

  @Column({ name: 'last_position', nullable: true })
  last_position: number;
}
