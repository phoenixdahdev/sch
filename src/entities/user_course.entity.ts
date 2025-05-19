import { Course } from './course.entity';
import { UserProgress } from './user_progress.entity';
import { UserAssessment } from './user_assessment.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('user_courses')
@Unique(['user_id', 'course_id'])
export class UserCourse extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => Course, (course) => course.user_courses)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  course_id: string;

  @Column({
    name: 'progress_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progress_percentage: number;

  @Column({ name: 'is_completed', default: false })
  is_completed: boolean;

  @Column({ name: 'completed_at', nullable: true })
  completed_at: Date;

  @Column({ name: 'expires_at', nullable: true })
  expires_at: Date;

  @OneToMany(() => UserProgress, (user_progress) => user_progress.user_course)
  progresses: UserProgress[];

  @OneToMany(
    () => UserAssessment,
    (user_assessment) => user_assessment.user_course,
  )
  assessments: UserAssessment[];

  @Column({
    name: 'enrolled_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  enrolled_at: Date;
}
