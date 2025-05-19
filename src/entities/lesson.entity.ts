import { Module } from './module.entity';
import { Material } from './material.entity';
import { UserProgress } from './user_progress.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('lessons')
export class Lesson extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: 0 })
  position: number;

  @Column({ name: 'video_url', nullable: true })
  video_url: string;

  @Column({ name: 'duration_in_minutes', default: 0 })
  duration_in_minutes: number;

  @ManyToOne(() => Module, (module) => module.lessons)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id' })
  module_id: string;

  @OneToMany(() => Material, (material) => material.lesson)
  materials: Material[];

  @OneToMany(() => UserProgress, (user_progress) => user_progress.lesson)
  user_progresses: UserProgress[];
}
