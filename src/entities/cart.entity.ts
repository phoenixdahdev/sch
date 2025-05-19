import { CartItem } from './cart_item.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('carts')
export class Cart extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @OneToMany(() => CartItem, (cart_item) => cart_item.cart)
  items: CartItem[];

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  total_price: number;
}
