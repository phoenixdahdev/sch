import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column } from 'typeorm';

@Entity('payment_intents')
export class PaymentIntent extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'cart_id' })
  cart_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string; // pending, succeeded, failed

  @Column({ name: 'payment_service_intent_id', nullable: true })
  payment_service_intent_id: string; // External payment service ID

  @Column({ nullable: true, type: 'json' })
  metadata: object;
}
