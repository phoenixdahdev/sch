import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Question } from './question.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('options')
export class Option extends AbstractBaseEntity {
  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'is_correct', default: false })
  is_correct: boolean;

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Question, (question) => question.options)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'question_id' })
  question_id: string;
}
