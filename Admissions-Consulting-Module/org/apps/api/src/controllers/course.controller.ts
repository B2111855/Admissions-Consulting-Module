import {
  Get,
  Post,
  Put,
  Delete,
  JsonController,
  QueryParam,
  Param,
  Body,
  Res,
} from 'routing-controllers';
import jsend from '../jsend';
import courseService from '../services/course.service';
import 'reflect-metadata';

@JsonController('/courses')
export class CourseController {
  @Get('')
  @Get('/cate')
  async getAllCategories(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await courseService.getAllCategories(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch categories'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/active')
  async getActiveCourses(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await courseService.getActiveCourses(page, limit);
      if (!result) {
        return res
          .status(500)
          .json(jsend.error('Failed to fetch active courses'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: string, @Res() res: any) {
    const courseId = parseInt(id, 10);
    try {
      const course = await courseService.getCourseById(courseId);
      if (!course) {
        return res.status(404).json(jsend.fail('Course not found'));
      }
      return res.json(jsend.success(course));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('/categories/with-courses')
  async createCategoryWithCourses(@Body() data: any, @Res() res: any) {
    try {
      const course = await courseService.createCategory(data);
      if (!course) {
        return res.status(400).json(jsend.fail('Failed to create category'));
      }
      return res.status(201).json(jsend.success(course));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('/categories/:categoryId/courses')
  async createCoursesForExistingCategory(
    @Body() data: any,
    @Param('categoryId') categoryId: string,
    @Res() res: any
  ) {
    const categoryIdNum = parseInt(categoryId, 10);
    try {
      const course = await courseService.createCoursesForExistingCategory(
        categoryIdNum,
        data
      );
      if (!course) {
        // This case might be hit if the service layer returns null, which could mean a validation issue, etc.
        return res
          .status(400)
          .json(jsend.fail('Failed to create course with category'));
      }
      return res.status(201).json(jsend.success(course));
    } catch (e: any) {
      // The service now throws specific errors for P2002/P2003, which is great.
      // You can refine this to send more specific HTTP status codes if needed.
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateCourse(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const course = await courseService.updateCourse(id, data);
      if (!course) {
        return res
          .status(404)
          .json(jsend.fail('Course not found or update failed'));
      }
      return res.json(jsend.success(course));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteCourse(@Param('id') id: number, @Res() res: any) {
    try {
      const deletedCourse = await courseService.deleteCourse(id);
      if (!deletedCourse) {
        return res.status(404).json(jsend.fail('Course not found'));
      }
      return res.json(jsend.success(null, 'Course deleted successfully'));
    } catch (e: any) {
      return res
        .status(500)
        .json(jsend.error(e.message || 'Internal server error'));
    }
  }
}
