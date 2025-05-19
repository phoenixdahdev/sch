import { Option } from './option.entity';
import { Assessment } from './assessment.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('questions')
export class Question extends AbstractBaseEntity {
  @Column({ type: 'text' })
  text: string;

  @Column()
  type: string; // multiple-choice, true-false, etc.

  @Column({ default: 0 })
  position: number;

  @Column({ default: 1 })
  points: number;

  @ManyToOne(() => Assessment, (assessment) => assessment.questions)
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ name: 'assessment_id' })
  assessment_id: string;

  @OneToMany(() => Option, (option) => option.question)
  options: Option[];
}
