import { Course } from './course.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('categories')
export class Category extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];

  @Column({ name: 'is_active', default: true })
  is_active: boolean;
}
