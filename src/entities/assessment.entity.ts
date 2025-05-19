import { Module } from './module.entity';
import { Question } from './question.entity';
import { UserAssessment } from './user_assessment.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('assessments')
export class Assessment extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  position: number;

  @Column({ name: 'time_limit', default: 60 })
  time_limit: number; // in minutes

  @Column({ name: 'passing_score', default: 70 })
  passing_score: number; // percentage

  @ManyToOne(() => Module, (module) => module.assessments)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id' })
  module_id: string;

  @OneToMany(() => Question, (question) => question.assessment)
  questions: Question[];

  @OneToMany(
    () => UserAssessment,
    (user_assessment) => user_assessment.assessment,
  )
  user_assessments: UserAssessment[];
}
