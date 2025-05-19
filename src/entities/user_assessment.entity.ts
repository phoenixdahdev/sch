import { UserCourse } from './user_course.entity';
import { Assessment } from './assessment.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('user_assessments')
@Unique(['user_course_id', 'assessment_id'])
export class UserAssessment extends AbstractBaseEntity {
  @ManyToOne(() => UserCourse, (user_course) => user_course.assessments)
  @JoinColumn({ name: 'user_course_id' })
  user_course: UserCourse;

  @Column({ name: 'user_course_id' })
  user_course_id: string;

  @ManyToOne(() => Assessment, (assessment) => assessment.user_assessments)
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ name: 'assessment_id' })
  assessment_id: string;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'is_passed', default: false })
  is_passed: boolean;

  @Column({ name: 'completed_at', nullable: true })
  completed_at: Date;

  @Column({ type: 'json', nullable: true })
  answers: object;

  @Column({
    name: 'started_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  started_at: Date;
}
