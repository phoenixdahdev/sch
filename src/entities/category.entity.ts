import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { MainCategory } from './main-category.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('categories')
export class Category extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @ManyToOne(() => MainCategory, (mainCategory) => mainCategory.categories)
  mainCategory: MainCategory;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];

  @Column({ name: 'is_active', default: true })
  is_active: boolean;
}
