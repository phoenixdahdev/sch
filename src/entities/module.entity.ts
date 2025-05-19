import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';
import { Assessment } from './assessment.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('modules')
export class Module extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  position: number;

  @Column({ name: 'total_hours', default: 0 })
  total_hours: number;

  @ManyToOne(() => Course, (course) => course.modules)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  course_id: string;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons: Lesson[];

  @OneToMany(() => Assessment, (assessment) => assessment.module)
  assessments: Assessment[];
}
