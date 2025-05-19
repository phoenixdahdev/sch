import { Course } from './course.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

@Entity('promotions')
export class Promotion extends AbstractBaseEntity {
  @Column()
  code: string;

  @Column({ name: 'discount_type' })
  discount_type: string; // percentage, fixed

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discount_value: number;

  @Column({ name: 'start_date', nullable: true })
  start_date: Date;

  @Column({ name: 'end_date', nullable: true })
  end_date: Date;

  @Column({ name: 'is_active', default: false })
  is_active: boolean;

  @Column({ name: 'max_uses', nullable: true })
  max_uses: number;

  @Column({ name: 'used_count', default: 0 })
  used_count: number;

  @ManyToMany(() => Course)
  @JoinTable({
    name: 'promotion_courses',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' },
  })
  applicable_courses: Course[];
}
