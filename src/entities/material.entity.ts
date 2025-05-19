import { Lesson } from './lesson.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('materials')
export class Material extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  type: string; // document, video, link, etc.

  @Column()
  url: string;

  @Column({ default: 0 })
  position: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.materials)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'lesson_id' })
  lesson_id: string;
}
