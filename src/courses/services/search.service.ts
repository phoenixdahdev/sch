import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '@entities/category.entity';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { SearchQueryDto, AdvancedSearchDto } from '@dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async search(query: SearchQueryDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const searchTerm = query.term || '';

    let whereCondition: FindOptionsWhere<Course>[] | FindOptionsWhere<Course> =
      {
        is_published: true,
      };

    if (searchTerm) {
      whereCondition = [
        { is_published: true, title: Like(`%${searchTerm}%`) },
        { is_published: true, description: Like(`%${searchTerm}%`) },
      ];
    }

    const [courses, total] = await this.courseRepository.findAndCount({
      where: whereCondition,
      relations: ['category'],
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    const total_pages = Math.ceil(total / limit);

    const meta = {
      total,
      limit,
      page,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1,
    };

    return {
      data: { courses },
      message: 'Search results',
      meta: meta,
    };
  }

  async getSuggestions(term: string): Promise<string[]> {
    if (!term || term.length < 2) return [];

    const courses = await this.courseRepository.find({
      where: [
        { title: Like(`%${term}%`), is_published: true },
        { description: Like(`%${term}%`), is_published: true },
      ],
      select: ['title'],
      take: 10,
    });

    return courses.map((course) => course.title);
  }

  async getFilters(): Promise<{ categories: Category[]; levels: string[] }> {
    const categories = await this.categoryRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });

    const levels = ['beginner', 'intermediate', 'advanced'];

    return { categories, levels };
  }

  async advancedSearch(query: AdvancedSearchDto) {
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    let whereCondition: FindOptionsWhere<Course>[] | FindOptionsWhere<Course> =
      {
        is_published: true,
      };

    if (query.term) {
      whereCondition = [
        { is_published: true, title: Like(`%${query.term}%`) },
        { is_published: true, description: Like(`%${query.term}%`) },
      ];
    }

    if (query.category_id) {
      const categoryIds = query.category_id;

      whereCondition = Array.isArray(whereCondition)
        ? whereCondition.map((cond) => ({
            ...cond,
            category_id: In(categoryIds),
          }))
        : { ...whereCondition, category_id: In(categoryIds) };
    }

    if (query.level) {
      const levels = query.level;

      whereCondition = Array.isArray(whereCondition)
        ? whereCondition.map((cond) => ({ ...cond, level: In(levels) }))
        : { ...whereCondition, level: In(levels) };
    }

    if (query.price_min !== undefined || query.price_max !== undefined) {
      const priceCondition: FindOptionsWhere<Course> = {};
      if (query.price_min !== undefined)
        priceCondition.price = In([query.price_min]);
      if (query.price_max !== undefined)
        priceCondition.price = In([query.price_max]);

      whereCondition = Array.isArray(whereCondition)
        ? whereCondition.map((cond) => ({ ...cond, ...priceCondition }))
        : { ...whereCondition, ...priceCondition };
    }

    if (query.rating_min) {
      whereCondition = Array.isArray(whereCondition)
        ? whereCondition.map((cond) => ({
            ...cond,
            average_rating: In([query.rating_min]),
          }))
        : { ...whereCondition, average_rating: In([query.rating_min]) };
    }

    const orderBy: Record<string, 'ASC' | 'DESC'> = {};
    const sortOrder = query.sort_order === 'asc' ? 'ASC' : 'DESC';

    switch (query.sort_by) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.average_rating = sortOrder;
        break;
      case 'popularity':
        orderBy.enrolled_count = sortOrder;
        break;
      case 'newest':
      default:
        orderBy.created_at = sortOrder;
        break;
    }

    const [courses, total] = await this.courseRepository.findAndCount({
      where: whereCondition,
      relations: ['category'],
      order: orderBy,
      take: limit,
      skip,
    });

    const total_pages = Math.ceil(total / limit);

    const meta = {
      total,
      limit,
      page,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1,
    };
    return {
      data: { courses },
      message: 'Search results',
      meta: meta,
    };
  }
}
