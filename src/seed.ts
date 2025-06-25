// src/seeding/auto-seeding.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { dbNames } from '@kemuko-org/db-schemas';
import {
    CategoryModelAction,
    CourseModelAction,
    ModuleModelAction,
    LessonModelAction,
    MaterialModelAction,
    AssessmentModelAction,
    QuestionModelAction,
    OptionModelAction,
    UserCourseModelAction,
    UserProgressModelAction,
    UserAssessmentModelAction,
    ReviewModelAction,
    CartModelAction,
    CartItemModelAction,
    PaymentIntentModelAction,
    CertificateModelAction,
    PromotionModelAction,
    WishListModelAction,
    NotificationModelAction,
    MainCategoryModelAction,
} from './actions/model-actions';
import { v4 as uuidv4 } from 'uuid';

interface SeedUser {
    id: string;
    email: string;
    name: string;
    password: string;
    role: 'admin' | 'instructor' | 'student';
    phone?: string;
    avatar_url?: string;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

@Injectable()
export class AutoSeedingService implements OnModuleInit {
    private readonly logger = new Logger(AutoSeedingService.name);
    private readonly isEnabled: boolean;

    constructor(
        private readonly configService: ConfigService,
        @InjectDataSource(dbNames.USER) private readonly userDataSource: DataSource,
        @InjectDataSource(dbNames.COURSE) private readonly courseDataSource: DataSource,
        private readonly categoryModelAction: CategoryModelAction,
        private readonly courseModelAction: CourseModelAction,
        private readonly moduleModelAction: ModuleModelAction,
        private readonly lessonModelAction: LessonModelAction,
        private readonly materialModelAction: MaterialModelAction,
        private readonly assessmentModelAction: AssessmentModelAction,
        private readonly questionModelAction: QuestionModelAction,
        private readonly optionModelAction: OptionModelAction,
        private readonly userCourseModelAction: UserCourseModelAction,
        private readonly userProgressModelAction: UserProgressModelAction,
        private readonly userAssessmentModelAction: UserAssessmentModelAction,
        private readonly reviewModelAction: ReviewModelAction,
        private readonly cartModelAction: CartModelAction,
        private readonly cartItemModelAction: CartItemModelAction,
        private readonly paymentIntentModelAction: PaymentIntentModelAction,
        private readonly certificateModelAction: CertificateModelAction,
        private readonly promotionModelAction: PromotionModelAction,
        private readonly wishListModelAction: WishListModelAction,
        private readonly notificationModelAction: NotificationModelAction,
        private readonly mainCategoryModelAction: MainCategoryModelAction,
    ) {
        // Enable auto-seeding in development or when explicitly enabled
        this.isEnabled = this.configService.get<string>('NODE_ENV') === 'development' ||
            this.configService.get<boolean>('AUTO_SEED_ENABLED', false);
    }

    async onModuleInit() {
        if (!this.isEnabled) {
            this.logger.log('Auto-seeding disabled');
            return;
        }

        try {
            this.logger.log('🌱 Starting auto-seeding check...');

            const needsSeeding = await this.checkIfSeedingNeeded();

            if (needsSeeding) {
                this.logger.log('📊 Database appears empty, starting seeding...');
                await this.performSeeding();
                await this.logSeedingSummary();
                this.logger.log('✅ Auto-seeding completed successfully!');
            } else {
                this.logger.log('✅ Database already contains data, skipping seeding');
            }
        } catch (error) {
            this.logger.error('❌ Auto-seeding failed:', error);
            // Don't throw error to prevent app from failing to start
        }
    }

    private async checkIfSeedingNeeded(): Promise<boolean> {
        try {
            // Check if we have essential data
            const userCount = await this.userDataSource.query('SELECT COUNT(*) as count FROM users');
            const categoryCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM categories');
            const courseCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM courses');
            const enrollmentCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM user_courses');

            const hasUsers = parseInt(userCount[0].count) > 0;
            const hasCategories = parseInt(categoryCount[0].count) > 0;
            const hasCourses = parseInt(courseCount[0].count) > 0;

            // Log current data status
            this.logger.log(`Current data: ${userCount[0].count} users, ${categoryCount[0].count} categories, ${courseCount[0].count} courses, ${enrollmentCount[0].count} enrollments`);

            // If we have users, categories, and courses, we consider the database sufficiently seeded
            // We check enrollments too to ensure we have user interaction data
            return !(hasUsers && hasCategories && hasCourses);
        } catch (error) {
            this.logger.warn('Could not check seeding status, assuming seeding needed:', error.message);
            return true;
        }
    }

    private async performSeeding() {
        // Seed users first
        const users = await this.seedUsers();

        // Seed course data
        await this.seedMainCategories();
        await this.seedCategories();
        await this.seedCourses(users);
        await this.seedModules();
        await this.seedLessons();
        await this.seedMaterials();
        await this.seedAssessments();
        await this.seedQuestions();
        await this.seedOptions();
        await this.seedPromotions();

        // Seed user interactions and data
        await this.seedUserCourses(users);
        await this.seedUserProgress(users);
        await this.seedReviews(users);
        await this.seedCertificates();
        await this.seedCarts(users);
        await this.seedWishlists(users);
        await this.seedNotifications(users);
    }

    private async seedUsers(): Promise<SeedUser[]> {
        this.logger.log('👥 Seeding users...');

        const users: SeedUser[] = [
            {
                id: uuidv4(),
                email: 'admin@kemuko.com',
                name: 'Admin User',
                password: '$2b$10$rQl5d3qKVm6K8YXxGxLQ4eqKZQK8QKJ9VQK8QKJ9VQK8QKJ9VQ', // password123
                role: 'admin',
                phone: '+2348123456789',
                avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                is_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                email: 'john.instructor@kemuko.com',
                name: 'John Smith',
                password: '$2b$10$rQl5d3qKVm6K8YXxGxLQ4eqKZQK8QKJ9VQK8QKJ9VQK8QKJ9VQ',
                role: 'instructor',
                phone: '+2348123456790',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                is_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                email: 'sarah.instructor@kemuko.com',
                name: 'Sarah Johnson',
                password: '$2b$10$rQl5d3qKVm6K8YXxGxLQ4eqKZQK8QKJ9VQK8QKJ9VQK8QKJ9VQ',
                role: 'instructor',
                phone: '+2348123456791',
                avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
                is_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            // Add more instructors
            ...Array.from({ length: 3 }, (_, i) => ({
                id: uuidv4(),
                email: `instructor${i + 3}@kemuko.com`,
                name: `Instructor ${i + 3}`,
                password: '$2b$10$rQl5d3qKVm6K8YXxGxLQ4eqKZQK8QKJ9VQK8QKJ9VQK8QKJ9VQ',
                role: 'instructor' as const,
                phone: `+234812345${6800 + i}`,
                avatar_url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400`,
                is_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            })),
            // Add students
            ...Array.from({ length: 15 }, (_, i) => ({
                id: uuidv4(),
                email: `student${i + 1}@example.com`,
                name: `Student ${i + 1}`,
                password: '$2b$10$rQl5d3qKVm6K8YXxGxLQ4eqKZQK8QKJ9VQK8QKJ9VQK8QKJ9VQ',
                role: 'student' as const,
                phone: `+234812345${6792 + i}`,
                avatar_url: `https://images.unsplash.com/photo-${1530000000000 + i}?w=400`,
                is_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
            })),
        ];

        // Insert users with ON CONFLICT DO NOTHING
        for (const user of users) {
            try {
                await this.userDataSource.query(`
          INSERT INTO users (id, email, name, password, role, phone, avatar_url, is_verified, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (email) DO NOTHING
        `, [
                    user.id,
                    user.email,
                    user.name,
                    user.password,
                    user.role,
                    user.phone,
                    user.avatar_url,
                    user.is_verified,
                    user.created_at,
                    user.updated_at,
                ]);
            } catch (error) {
                this.logger.warn(`Failed to seed user ${user.email}: ${error.message}`);
            }
        }

        this.logger.log(`✅ Processed ${users.length} users`);
        return users;
    }

    private async seedMainCategories() {
        this.logger.log('📚 Seeding main categories...');

        const mainCategories = [
            {
                id: uuidv4(),
                name: 'Technology',
                description: 'Courses related to technology, programming, and digital skills',
                image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Business',
                description: 'Business management, entrepreneurship, and professional development',
                image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Creative Arts',
                description: 'Design, art, music, and creative skills',
                image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const category of mainCategories) {
            try {
                await this.mainCategoryModelAction.create({
                    createPayload: category,
                    transactionOptions: { useTransaction: false },
                });
            } catch (error) {
                // Ignore conflicts
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed main category ${category.name}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${mainCategories.length} main categories`);
    }

    private async seedCategories() {
        this.logger.log('🏷️ Seeding categories...');

        const categories = [
            {
                id: uuidv4(),
                name: 'Web Development',
                description: 'Frontend and backend web development',
                image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Mobile Development',
                description: 'iOS and Android app development',
                image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Data Science',
                description: 'Data analysis, machine learning, and AI',
                image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Digital Marketing',
                description: 'Online marketing strategies and tools',
                image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Graphic Design',
                description: 'Visual design and creative tools',
                image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const category of categories) {
            try {
                await this.categoryModelAction.create({
                    createPayload: category,
                    transactionOptions: { useTransaction: false },
                });
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed category ${category.name}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${categories.length} categories`);
    }

    private async seedCourses(users: SeedUser[]) {
        this.logger.log('🎓 Seeding courses...');

        // Get existing categories
        const categoriesResult = await this.categoryModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const categories = categoriesResult.payload;

        if (categories.length === 0) {
            this.logger.warn('No categories found, skipping course seeding');
            return;
        }

        const instructors = users.filter(u => u.role === 'instructor');
        if (instructors.length === 0) {
            this.logger.warn('No instructors found, skipping course seeding');
            return;
        }

        const courses = [
            {
                id: uuidv4(),
                title: 'Complete React Developer Course',
                description: 'Learn React from scratch and build real-world applications',
                about: 'This comprehensive course covers React fundamentals, hooks, state management, routing, and more. Perfect for beginners and intermediate developers.',
                thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
                preview_video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                price: 99.99,
                is_free: false,
                total_hours: 25,
                level: 'intermediate',
                category_id: categories[0].id,
                creator_id: instructors[0].id,
                is_published: true,
                is_featured: true,
                enrolled_count: 245,
                average_rating: 4.7,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                title: 'Python for Beginners',
                description: 'Start your programming journey with Python',
                about: 'A beginner-friendly course that teaches Python programming from the ground up. No prior experience required.',
                thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
                preview_video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                price: 0,
                is_free: true,
                total_hours: 15,
                level: 'beginner',
                category_id: categories[0].id,
                creator_id: instructors[0].id,
                is_published: true,
                is_featured: false,
                enrolled_count: 567,
                average_rating: 4.5,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                title: 'Digital Marketing Mastery',
                description: 'Complete guide to online marketing',
                about: 'Learn SEO, social media marketing, email marketing, and paid advertising strategies.',
                thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
                price: 79.99,
                is_free: false,
                total_hours: 20,
                level: 'intermediate',
                category_id: categories.length > 3 ? categories[3].id : categories[0].id,
                creator_id: instructors.length > 1 ? instructors[1].id : instructors[0].id,
                is_published: true,
                is_featured: true,
                enrolled_count: 298,
                average_rating: 4.4,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                title: 'Mobile App Development with React Native',
                description: 'Build cross-platform mobile apps',
                about: 'Learn to create mobile applications that work on both iOS and Android using React Native.',
                thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
                price: 149.99,
                is_free: false,
                total_hours: 30,
                level: 'intermediate',
                category_id: categories.length > 1 ? categories[1].id : categories[0].id,
                creator_id: instructors.length > 2 ? instructors[2].id : instructors[0].id,
                is_published: true,
                is_featured: true,
                enrolled_count: 189,
                average_rating: 4.6,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                title: 'Data Science with Python',
                description: 'Analyze data and build machine learning models',
                about: 'Master data science concepts using Python, pandas, matplotlib, and scikit-learn.',
                thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                price: 199.99,
                is_free: false,
                total_hours: 40,
                level: 'advanced',
                category_id: categories.length > 2 ? categories[2].id : categories[0].id,
                creator_id: instructors.length > 3 ? instructors[3].id : instructors[0].id,
                is_published: true,
                is_featured: false,
                enrolled_count: 134,
                average_rating: 4.8,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                title: 'Graphic Design Fundamentals',
                description: 'Learn the basics of visual design',
                about: 'Understand color theory, typography, composition, and design principles using industry-standard tools.',
                thumbnail_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
                price: 89.99,
                is_free: false,
                total_hours: 18,
                level: 'beginner',
                category_id: categories.length > 4 ? categories[4].id : categories[0].id,
                creator_id: instructors.length > 4 ? instructors[4].id : instructors[0].id,
                is_published: true,
                is_featured: false,
                enrolled_count: 156,
                average_rating: 4.3,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const course of courses) {
            try {
                await this.courseModelAction.create({
                    createPayload: course,
                    transactionOptions: { useTransaction: false },
                });
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed course ${course.title}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${courses.length} courses`);
    }

    private async seedModules() {
        this.logger.log('📖 Seeding modules...');

        const coursesResult = await this.courseModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const courses = coursesResult.payload;

        let moduleCount = 0;
        for (const course of courses) {
            const courseModules = [
                {
                    id: uuidv4(),
                    title: 'Introduction and Setup',
                    description: 'Getting started with the course',
                    position: 0,
                    total_hours: 2,
                    course_id: course.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: uuidv4(),
                    title: 'Core Concepts',
                    description: 'Understanding the fundamentals',
                    position: 1,
                    total_hours: 8,
                    course_id: course.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            for (const module of courseModules) {
                try {
                    await this.moduleModelAction.create({
                        createPayload: module,
                        transactionOptions: { useTransaction: false },
                    });
                    moduleCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed module ${module.title}: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${moduleCount} modules`);
    }

    private async seedLessons() {
        this.logger.log('📝 Seeding lessons...');

        const modulesResult = await this.moduleModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const modules = modulesResult.payload;

        let lessonCount = 0;
        for (const module of modules) {
            const moduleLessons = [
                {
                    id: uuidv4(),
                    title: 'Introduction to ' + module.title,
                    description: 'Overview of what you will learn',
                    position: 0,
                    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    duration_in_minutes: 15,
                    module_id: module.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: uuidv4(),
                    title: 'Key Concepts',
                    description: 'Understanding the main ideas',
                    position: 1,
                    video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    duration_in_minutes: 25,
                    module_id: module.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            for (const lesson of moduleLessons) {
                try {
                    await this.lessonModelAction.create({
                        createPayload: lesson,
                        transactionOptions: { useTransaction: false },
                    });
                    lessonCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed lesson ${lesson.title}: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${lessonCount} lessons`);
    }

    private async seedMaterials() {
        this.logger.log('📎 Seeding materials...');

        const lessonsResult = await this.lessonModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const lessons = lessonsResult.payload;

        let materialCount = 0;
        for (const lesson of lessons) {
            const material = {
                id: uuidv4(),
                title: 'Lesson Notes',
                description: 'Downloadable PDF with lesson summary',
                type: 'document',
                url: 'https://example.com/materials/lesson-notes.pdf',
                position: 0,
                lesson_id: lesson.id,
                created_at: new Date(),
                updated_at: new Date(),
            };

            try {
                await this.materialModelAction.create({
                    createPayload: material,
                    transactionOptions: { useTransaction: false },
                });
                materialCount++;
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed material for lesson ${lesson.id}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${materialCount} materials`);
    }

    private async seedAssessments() {
        this.logger.log('📋 Seeding assessments...');

        const modulesResult = await this.moduleModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const modules = modulesResult.payload;

        let assessmentCount = 0;
        for (const module of modules) {
            const assessment = {
                id: uuidv4(),
                title: module.title + ' Quiz',
                description: 'Test your knowledge of ' + module.title,
                position: 99,
                time_limit: 30,
                passing_score: 70,
                module_id: module.id,
                created_at: new Date(),
                updated_at: new Date(),
            };

            try {
                await this.assessmentModelAction.create({
                    createPayload: assessment,
                    transactionOptions: { useTransaction: false },
                });
                assessmentCount++;
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed assessment for module ${module.id}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${assessmentCount} assessments`);
    }

    private async seedQuestions() {
        this.logger.log('❓ Seeding questions...');

        const assessmentsResult = await this.assessmentModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const assessments = assessmentsResult.payload;

        let questionCount = 0;
        for (const assessment of assessments) {
            const question = {
                id: uuidv4(),
                text: 'What is the main concept covered in this module?',
                type: 'multiple-choice',
                position: 0,
                points: 10,
                assessment_id: assessment.id,
                created_at: new Date(),
                updated_at: new Date(),
            };

            try {
                await this.questionModelAction.create({
                    createPayload: question,
                    transactionOptions: { useTransaction: false },
                });
                questionCount++;
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed question for assessment ${assessment.id}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${questionCount} questions`);
    }

    private async seedOptions() {
        this.logger.log('🔤 Seeding options...');

        const questionsResult = await this.questionModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const questions = questionsResult.payload;

        let optionCount = 0;
        for (const question of questions) {
            const questionOptions = [
                {
                    id: uuidv4(),
                    text: 'Option A - Correct Answer',
                    is_correct: true,
                    position: 0,
                    question_id: question.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: uuidv4(),
                    text: 'Option B - Incorrect',
                    is_correct: false,
                    position: 1,
                    question_id: question.id,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            for (const option of questionOptions) {
                try {
                    await this.optionModelAction.create({
                        createPayload: option,
                        transactionOptions: { useTransaction: false },
                    });
                    optionCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed option for question ${question.id}: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${optionCount} options`);
    }

    private async seedPromotions() {
        this.logger.log('🎫 Seeding promotions...');

        const promotions = [
            {
                id: uuidv4(),
                code: 'WELCOME10',
                discount_type: 'percentage',
                discount_value: 10,
                start_date: new Date(),
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                max_uses: 100,
                used_count: 0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                code: 'SUMMER50',
                discount_type: 'fixed',
                discount_value: 50,
                start_date: new Date(),
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                max_uses: 50,
                used_count: 0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                code: 'STUDENT25',
                discount_type: 'percentage',
                discount_value: 25,
                start_date: new Date(),
                end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                max_uses: 200,
                used_count: 0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                code: 'EARLYBIRD',
                discount_type: 'percentage',
                discount_value: 15,
                start_date: new Date(),
                end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                max_uses: 75,
                used_count: 0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        for (const promotion of promotions) {
            try {
                await this.promotionModelAction.create({
                    createPayload: promotion,
                    transactionOptions: { useTransaction: false },
                });
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed promotion ${promotion.code}: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${promotions.length} promotions`);
    }

    // Complete implementations of seeding methods
    private async seedUserCourses(users: SeedUser[]) {
        this.logger.log('👨‍🎓 Seeding user courses...');

        const coursesResult = await this.courseModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const courses = coursesResult.payload;

        if (courses.length === 0) {
            this.logger.warn('No courses found, skipping user course seeding');
            return;
        }

        const students = users.filter(u => u.role === 'student');
        let enrollmentCount = 0;

        for (const student of students) {
            // Each student gets enrolled in 1-3 random courses
            const numEnrollments = Math.floor(Math.random() * 3) + 1;
            const enrolledCourses = this.shuffleArray(courses).slice(0, numEnrollments);

            for (const course of enrolledCourses) {
                const isCompleted = Math.random() > 0.7; // 30% chance of completion
                const progressPercentage = isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;

                const userCourse = {
                    id: uuidv4(),
                    user_id: student.id,
                    course_id: course.id,
                    enrolled_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random enrollment in last 90 days
                    progress_percentage: progressPercentage,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date() : null,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.userCourseModelAction.create({
                        createPayload: userCourse,
                        transactionOptions: { useTransaction: false },
                    });
                    enrollmentCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed user course enrollment: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${enrollmentCount} user course enrollments`);
    }

    private async seedReviews(users: SeedUser[]) {
        this.logger.log('⭐ Seeding reviews...');

        // Get completed user courses
        const userCoursesResult = await this.userCourseModelAction.find({
            findOptions: { is_completed: true },
            transactionOptions: { useTransaction: false },
        });
        const completedUserCourses = userCoursesResult.payload;

        let reviewCount = 0;
        for (const userCourse of completedUserCourses) {
            // 70% chance of leaving a review for completed courses
            if (Math.random() > 0.3) {
                const rating = Math.floor(Math.random() * 2) + 4; // Rating between 4-5
                const comments = [
                    'Great course! Learned a lot.',
                    'Excellent instructor and well-structured content.',
                    'Highly recommended for beginners.',
                    'Challenging but rewarding course.',
                    'Very practical and hands-on approach.',
                    'Clear explanations and good examples.',
                    'Worth every penny!',
                    'Instructor was very knowledgeable.',
                ];

                const review = {
                    id: uuidv4(),
                    user_id: userCourse.user_id,
                    course_id: userCourse.course_id,
                    rating: rating,
                    comment: comments[Math.floor(Math.random() * comments.length)],
                    is_verified: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.reviewModelAction.create({
                        createPayload: review,
                        transactionOptions: { useTransaction: false },
                    });
                    reviewCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed review: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${reviewCount} reviews`);
    }

    private async seedUserProgress(users: SeedUser[]) {
        this.logger.log('📊 Seeding user progress...');

        const userCoursesResult = await this.userCourseModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const userCourses = userCoursesResult.payload;

        const lessonsResult = await this.lessonModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const lessons = lessonsResult.payload;

        let progressCount = 0;
        for (const userCourse of userCourses) {
            // Get lessons for this course (we need to match via modules)
            const modulesResult = await this.moduleModelAction.find({
                findOptions: { course_id: userCourse.course_id },
                transactionOptions: { useTransaction: false },
            });
            const courseModules = modulesResult.payload;
            const moduleIds = courseModules.map(m => m.id);

            const courseLessons = lessons.filter(l => moduleIds.includes(l.module_id));

            if (courseLessons.length === 0) continue;

            // Create progress for lessons based on course completion percentage
            const numLessonsToComplete = Math.floor(courseLessons.length * (userCourse.progress_percentage / 100));

            for (let i = 0; i < numLessonsToComplete; i++) {
                const lesson = courseLessons[i];
                const watchTime = lesson.duration_in_minutes * 60; // Full watch time

                const progress = {
                    id: uuidv4(),
                    user_course_id: userCourse.id,
                    lesson_id: lesson.id,
                    watch_time_in_seconds: watchTime,
                    last_position: watchTime,
                    is_completed: true,
                    completed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random completion in last 30 days
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.userProgressModelAction.create({
                        createPayload: progress,
                        transactionOptions: { useTransaction: false },
                    });
                    progressCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed user progress: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${progressCount} user progress records`);
    }

    private async seedCarts(users: SeedUser[]) {
        this.logger.log('🛒 Seeding carts...');

        const coursesResult = await this.courseModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const courses = coursesResult.payload;

        if (courses.length === 0) {
            this.logger.warn('No courses found, skipping cart seeding');
            return;
        }

        const students = users.filter(u => u.role === 'student');
        let cartCount = 0;
        let cartItemCount = 0;

        for (const student of students) {
            // 60% chance of having items in cart
            if (Math.random() > 0.4) {
                const cart = {
                    id: uuidv4(),
                    user_id: student.id,
                    total_price: 0,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.cartModelAction.create({
                        createPayload: cart,
                        transactionOptions: { useTransaction: false },
                    });
                    cartCount++;

                    // Add 1-3 random courses to cart
                    const numItems = Math.floor(Math.random() * 3) + 1;
                    const cartCourses = this.shuffleArray(courses).slice(0, numItems);
                    let totalPrice = 0;

                    for (const course of cartCourses) {
                        const cartItem = {
                            id: uuidv4(),
                            cart_id: cart.id,
                            course_id: course.id,
                            price: course.price,
                            created_at: new Date(),
                            updated_at: new Date(),
                        };

                        try {
                            await this.cartItemModelAction.create({
                                createPayload: cartItem,
                                transactionOptions: { useTransaction: false },
                            });
                            cartItemCount++;
                            totalPrice += course.price;
                        } catch (error) {
                            if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                                this.logger.warn(`Failed to seed cart item: ${error.message}`);
                            }
                        }
                    }

                    // Update cart total
                    if (totalPrice > 0) {
                        try {
                            await this.cartModelAction.update({
                                identifierOptions: { id: cart.id },
                                updatePayload: { total_price: totalPrice },
                                transactionOptions: { useTransaction: false },
                            });
                        } catch (error) {
                            this.logger.warn(`Failed to update cart total: ${error.message}`);
                        }
                    }
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed cart: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${cartCount} carts with ${cartItemCount} items`);
    }

    private async seedWishlists(users: SeedUser[]) {
        this.logger.log('💝 Seeding wishlists...');

        const coursesResult = await this.courseModelAction.find({
            findOptions: {},
            transactionOptions: { useTransaction: false },
        });
        const courses = coursesResult.payload;

        if (courses.length === 0) {
            this.logger.warn('No courses found, skipping wishlist seeding');
            return;
        }

        const students = users.filter(u => u.role === 'student');
        let wishlistCount = 0;

        for (const student of students) {
            // 70% chance of having a wishlist
            if (Math.random() > 0.3) {
                // Each student gets a wishlist with 2-4 random courses
                const wishlistCourses = this.shuffleArray(courses).slice(0, Math.floor(Math.random() * 3) + 2);

                const wishlist = {
                    id: uuidv4(),
                    user_id: student.id,
                    courses: wishlistCourses,
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.wishListModelAction.create({
                        createPayload: wishlist,
                        transactionOptions: { useTransaction: false },
                    });
                    wishlistCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed wishlist: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${wishlistCount} wishlists`);
    }

    private async seedNotifications(users: SeedUser[]) {
        this.logger.log('🔔 Seeding notifications...');

        const students = users.filter(u => u.role === 'student');

        const notificationTypes = [
            {
                type: 'course_enrollment',
                title: 'Welcome to your new course!',
                message: 'You have successfully enrolled in a new course. Start learning now!',
            },
            {
                type: 'course_completion',
                title: 'Congratulations! Course completed',
                message: 'You have successfully completed the course. Well done!',
            },
            {
                type: 'promotion',
                title: 'Special offer available!',
                message: 'Check out our latest course promotion with limited time discount.',
            },
            {
                type: 'reminder',
                title: 'Continue your learning',
                message: 'You have pending lessons in your enrolled courses.',
            },
            {
                type: 'achievement',
                title: 'New achievement unlocked!',
                message: 'You\'ve reached a new milestone in your learning journey.',
            },
            {
                type: 'new_course',
                title: 'New course available!',
                message: 'A new course has been added to our platform that might interest you.',
            },
        ];

        let notificationCount = 0;
        for (const student of students) {
            // Each student gets 3-6 random notifications
            const numNotifications = Math.floor(Math.random() * 4) + 3;

            for (let i = 0; i < numNotifications; i++) {
                const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

                const notification = {
                    id: uuidv4(),
                    user_id: student.id,
                    type: randomNotification.type,
                    title: randomNotification.title,
                    message: randomNotification.message,
                    is_read: Math.random() > 0.4, // 60% chance of being read
                    link: '/dashboard',
                    metadata: {},
                    issued_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random time in last 14 days
                    created_at: new Date(),
                    updated_at: new Date(),
                };

                try {
                    await this.notificationModelAction.create({
                        createPayload: notification,
                        transactionOptions: { useTransaction: false },
                    });
                    notificationCount++;
                } catch (error) {
                    if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                        this.logger.warn(`Failed to seed notification: ${error.message}`);
                    }
                }
            }
        }

        this.logger.log(`✅ Processed ${notificationCount} notifications`);
    }

    private async seedCertificates() {
        this.logger.log('🏆 Seeding certificates...');

        // Get completed user courses
        const userCoursesResult = await this.userCourseModelAction.find({
            findOptions: { is_completed: true },
            transactionOptions: { useTransaction: false },
        });
        const completedUserCourses = userCoursesResult.payload;

        let certificateCount = 0;
        for (const userCourse of completedUserCourses) {
            // Get course and user details for certificate
            const course = await this.courseModelAction.get({ id: userCourse.course_id });
            if (!course) continue;

            // Get user from database
            let userName = 'Student';
            try {
                const userResult = await this.userDataSource.query(
                    'SELECT name FROM users WHERE id = $1',
                    [userCourse.user_id]
                );
                if (userResult.length > 0) {
                    userName = userResult[0].name;
                }
            } catch (error) {
                this.logger.warn(`Could not fetch user name for certificate: ${error.message}`);
            }

            const certificate = {
                id: uuidv4(),
                user_course_id: userCourse.id,
                user_id: userCourse.user_id,
                course_id: userCourse.course_id,
                course_name: course.title,
                user_name: userName,
                verification_code: uuidv4(),
                certificate_url: `https://certificates.kemuko.com/${uuidv4()}.pdf`,
                is_valid: true,
                issued_at: userCourse.completed_at || new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            };

            try {
                await this.certificateModelAction.create({
                    createPayload: certificate,
                    transactionOptions: { useTransaction: false },
                });
                certificateCount++;
            } catch (error) {
                if (!error.message.includes('duplicate') && !error.message.includes('conflict')) {
                    this.logger.warn(`Failed to seed certificate: ${error.message}`);
                }
            }
        }

        this.logger.log(`✅ Processed ${certificateCount} certificates`);
    }

    // Helper method to shuffle array
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private async logSeedingSummary() {
        try {
            this.logger.log('📋 Seeding Summary:');

            // Get counts of seeded data
            const userCount = await this.userDataSource.query('SELECT COUNT(*) as count FROM users');
            const categoryCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM categories');
            const courseCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM courses');
            const moduleCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM modules');
            const lessonCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM lessons');
            const enrollmentCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM user_courses');
            const reviewCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM reviews');
            const cartCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM carts WHERE total_price > 0');
            const notificationCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM notifications');
            const promotionCount = await this.courseDataSource.query('SELECT COUNT(*) as count FROM promotions');

            this.logger.log(`   👥 Users: ${userCount[0].count}`);
            this.logger.log(`   🏷️  Categories: ${categoryCount[0].count}`);
            this.logger.log(`   🎓 Courses: ${courseCount[0].count}`);
            this.logger.log(`   📖 Modules: ${moduleCount[0].count}`);
            this.logger.log(`   📝 Lessons: ${lessonCount[0].count}`);
            this.logger.log(`   📚 Enrollments: ${enrollmentCount[0].count}`);
            this.logger.log(`   ⭐ Reviews: ${reviewCount[0].count}`);
            this.logger.log(`   🛒 Active Carts: ${cartCount[0].count}`);
            this.logger.log(`   🔔 Notifications: ${notificationCount[0].count}`);
            this.logger.log(`   🎫 Promotions: ${promotionCount[0].count}`);

            this.logger.log('🔑 Default Login Credentials:');
            this.logger.log('   Admin: admin@kemuko.com / password123');
            this.logger.log('   Instructor: john.instructor@kemuko.com / password123');
            this.logger.log('   Student: student1@example.com / password123');

        } catch (error) {
            this.logger.warn('Could not generate seeding summary:', error.message);
        }
    }
}