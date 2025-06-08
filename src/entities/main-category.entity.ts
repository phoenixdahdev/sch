import { Entity, Column, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { AbstractBaseEntity } from '@kemuko-org/shared-utils';

@Entity('main_categories')
export class MainCategory extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @OneToMany(() => Category, (category) => category.mainCategory)
  categories: Category[];
}
