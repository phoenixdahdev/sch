import { Review } from './review.entity';
import { Module } from './module.entity';
import { Category } from './category.entity';
import { CartItem } from './cart_item.entity';
import { UserCourse } from './user_course.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('courses')
export class Course extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true, type: 'text' })
  about: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnail_url: string;

  @Column({ name: 'preview_video_url', nullable: true })
  preview_video_url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'is_free', default: false })
  is_free: boolean;

  @Column({ name: 'total_hours', default: 0 })
  total_hours: number;

  @Column({ nullable: true })
  level: string; // Beginner, Intermediate, Advanced

  @Column({ name: 'enrolled_count', default: 0 })
  enrolled_count: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  average_rating: number;

  @Column({ name: 'creator_id' })
  creator_id: string; // Store the user ID of the creator

  @Column({ name: 'creator_name', nullable: true })
  creator_name: string;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  category_id: string;

  @OneToMany(() => Module, (module) => module.course)
  modules: Module[];

  @OneToMany(() => Review, (review) => review.course)
  reviews: Review[];

  @OneToMany(() => UserCourse, (user_course) => user_course.course)
  user_courses: UserCourse[];

  @OneToMany(() => CartItem, (cart_item) => cart_item.course)
  cart_items: CartItem[];

  @Column({ name: 'is_published', default: true })
  is_published: boolean;

  @Column({ name: 'is_featured', default: false })
  is_featured: boolean;
}
