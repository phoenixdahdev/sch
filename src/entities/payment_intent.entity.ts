import { AbstractBaseEntity } from '@kemuko-org/shared-utils';
import { Entity, Column } from 'typeorm';

export enum Currency {
  NGN = 'NGN',
  USD = 'USD',
  GBP = 'GBP',
  EUR = 'EUR',
}

export enum PaymentIntentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity('payment_intents')
export class PaymentIntent extends AbstractBaseEntity {
  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'cart_id' })
  cart_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: PaymentIntentStatus,
  })
  status: PaymentIntentStatus;

  @Column({ name: 'payment_service_intent_id', nullable: true })
  payment_service_intent_id: string;

  @Column({ nullable: true, type: 'json' })
  metadata: object;
}
