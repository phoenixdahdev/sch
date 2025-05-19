import { Course } from './course.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('wish_lists')
export class WishList extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToMany(() => Course)
  @JoinTable({
    name: 'wish_list_courses',
    joinColumn: { name: 'wish_list_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' },
  })
  courses: Course[];
}
