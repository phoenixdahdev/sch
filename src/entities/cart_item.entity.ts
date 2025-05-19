import { Cart } from './cart.entity';
import { Course } from './course.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('cart_items')
@Unique(['cart_id', 'course_id'])
export class CartItem extends AbstractBaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'cart_id' })
  cart_id: string;

  @ManyToOne(() => Course, (course) => course.cart_items)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  course_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
