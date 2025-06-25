import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmitAssessmentDto } from '@dto/user-assessments.dto';
import { buildResponse } from '@kemuko-org/shared-utils';
import { Assessment, dbNames, Question, UserAssessment, UserCourse } from '@kemuko-org/db-schemas';

@Injectable()
export class UserAssessmentsService {
  constructor(
    @InjectRepository(UserAssessment, dbNames.COURSE)
    private userAssessmentRepository: Repository<UserAssessment>,
    @InjectRepository(UserCourse, dbNames.COURSE)
    private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(Assessment, dbNames.COURSE)
    private assessmentRepository: Repository<Assessment>,
    @InjectRepository(Question, dbNames.COURSE)
    private questionRepository: Repository<Question>,
  ) { }

  async getCourseAssessments(userId: string, courseId: string) {
    const userCourse = await this.userCourseRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!userCourse) {
      throw new NotFoundException(
        `You are not enrolled in course with ID ${courseId}`,
      );
    }
    const assessments = await this.userAssessmentRepository.find({
      where: { user_course_id: userCourse.id },
      relations: ['assessment'],
    });

    return buildResponse(
      { assessments: assessments },
      'Assessments retrieved successfully',
    );
  }

  async getAssessment(userId: string, courseId: string, assessmentId: string) {
    const userCourse = await this.userCourseRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!userCourse) {
      throw new NotFoundException(
        `You are not enrolled in course with ID ${courseId}`,
      );
    }

    const userAssessment = await this.userAssessmentRepository.findOne({
      where: { user_course_id: userCourse.id, assessment_id: assessmentId },
      relations: ['assessment'],
    });

    if (!userAssessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found or not started`,
      );
    }

    return buildResponse(
      { userAssessment },
      'Assessment retrieved successfully',
    );
  }

  async startAssessment(
    userId: string,
    courseId: string,
    assessmentId: string,
  ) {
    const userCourse = await this.userCourseRepository.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!userCourse) {
      throw new NotFoundException(
        `You are not enrolled in course with ID ${courseId}`,
      );
    }
    const assessment = await this.assessmentRepository.findOne({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found`,
      );
    }

    let userAssessment = await this.userAssessmentRepository.findOne({
      where: { user_course_id: userCourse.id, assessment_id: assessmentId },
    });

    if (userAssessment) {
      if (userAssessment.completed_at) {
        throw new BadRequestException(
          'You have already completed this assessment',
        );
      }

      return userAssessment;
    }
    userAssessment = this.userAssessmentRepository.create({
      user_course_id: userCourse.id,
      assessment_id: assessmentId,
    });
    await this.userAssessmentRepository.save(userAssessment);
    return buildResponse({ userAssessment }, 'Assessment started successfully');
  }

  async submitAssessment(
    userId: string,
    courseId: string,
    assessmentId: string,
    submitAssessmentDto: SubmitAssessmentDto,
  ) {
    const userAssessmentData = await this.getAssessment(
      userId,
      courseId,
      assessmentId,
    );

    const userAssessment = userAssessmentData.data.userAssessment;
    if (userAssessment.completed_at) {
      throw new BadRequestException(
        'You have already completed this assessment',
      );
    }

    // Get all questions for this assessment
    const questions = await this.questionRepository.find({
      where: { assessment_id: assessmentId },
      relations: ['options'],
    });

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of questions) {
      totalPoints += question.points;
      const userAnswer = submitAssessmentDto.answers.find(
        (a) => a.question_id === question.id,
      );

      if (userAnswer) {
        if (question.type === 'multiple-choice') {
          const correctOption = question.options.find((o) => o.is_correct);

          if (
            correctOption &&
            userAnswer.option_ids.includes(correctOption.id)
          ) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'multiple-answer') {
          const correctOptions = question.options.filter((o) => o.is_correct);
          const incorrectOptions = question.options.filter(
            (o) => !o.is_correct,
          );

          let correct = true;
          for (const option of correctOptions) {
            if (!userAnswer.option_ids.includes(option.id)) {
              correct = false;
              break;
            }
          }

          for (const option of incorrectOptions) {
            if (userAnswer.option_ids.includes(option.id)) {
              correct = false;
              break;
            }
          }

          if (correct) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'true-false') {
          const correctOption = question.options.find((o) => o.is_correct);

          if (
            correctOption &&
            userAnswer.option_ids.includes(correctOption.id)
          ) {
            earnedPoints += question.points;
          }
        }
      }
    }

    const score =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    userAssessment.score = score;
    userAssessment.is_passed = score >= userAssessment.assessment.passing_score;
    userAssessment.completed_at = new Date();
    userAssessment.answers = submitAssessmentDto.answers;
    await this.userAssessmentRepository.save(userAssessment);
    return buildResponse(
      { userAssessment },
      'Assessment submitted successfully',
    );
  }

  async getResults(userId: string, courseId: string, assessmentId: string) {
    const userAssessmentData = await this.getAssessment(
      userId,
      courseId,
      assessmentId,
    );
    const userAssessment = userAssessmentData.data.userAssessment;
    if (!userAssessment.completed_at) {
      throw new BadRequestException(
        'You have not completed this assessment yet',
      );
    }
    const questions = await this.questionRepository.find({
      where: { assessment_id: assessmentId },
      relations: ['options'],
    });
    const userAnswers = userAssessment.answers as any[];

    const results = {
      assessment_id: assessmentId,
      score: userAssessment.score,
      is_passed: userAssessment.is_passed,
      passing_score: userAssessment.assessment.passing_score,
      completed_at: userAssessment.completed_at,
      questions: questions.map((question) => {
        const userAnswer = userAnswers.find(
          (a) => a.question_id === question.id,
        );
        const correctOptions = question.options.filter((o) => o.is_correct);

        return {
          question_id: question.id,
          text: question.text,
          type: question.type,
          points: question.points,
          user_answer: userAnswer ? userAnswer.option_ids : [],
          correct_answer: correctOptions.map((o) => o.id),
          is_correct: this.isAnswerCorrect(question, userAnswer),
          options: question.options.map((option) => ({
            id: option.id,
            text: option.text,
            is_correct: option.is_correct,
          })),
        };
      }),
    };

    return buildResponse(
      { results },
      'Assessment results retrieved successfully',
    );
  }

  private isAnswerCorrect(question: Question, userAnswer: any): boolean {
    if (!userAnswer) {
      return false;
    }
    if (question.type === 'multiple-choice') {
      const correctOption = question.options.find((o) => o.is_correct);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return correctOption && userAnswer.option_ids.includes(correctOption.id);
    } else if (question.type === 'multiple-answer') {
      const correctOptions = question.options.filter((o) => o.is_correct);
      const incorrectOptions = question.options.filter((o) => !o.is_correct);
      for (const option of correctOptions) {
        if (!userAnswer.option_ids.includes(option.id)) {
          return false;
        }
      }
      for (const option of incorrectOptions) {
        if (userAnswer.option_ids.includes(option.id)) {
          return false;
        }
      }

      return true;
    } else if (question.type === 'true-false') {
      const correctOption = question.options.find((o) => o.is_correct);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return correctOption && userAnswer.option_ids.includes(correctOption.id);
    }

    return false;
  }
}
