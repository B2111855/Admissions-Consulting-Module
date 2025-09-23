import { Get, Post, Put, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import courseCategoryService from '../services/course-category.service';
import 'reflect-metadata';

@JsonController('/course-categories')
export class CourseCategoryController {
  @Get('')
  async getAllCourseCategories(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await courseCategoryService.getAllCourseCategories(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch course categories'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getCourseCategoryById(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      const courseCategory = await courseCategoryService.getCourseCategoryById(id);
      if (!courseCategory) {
        return res.status(404).json(jsend.fail('Course category not found'));
      }
      return res.json(jsend.success(courseCategory));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('')
  async createCourseCategory(
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const courseCategory = await courseCategoryService.createCourseCategory(data);
      if (!courseCategory) {
        return res.status(400).json(jsend.fail('Failed to create course category'));
      }
      return res.status(201).json(jsend.success(courseCategory));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateCourseCategory(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const courseCategory = await courseCategoryService.updateCourseCategory(id, data);
      if (!courseCategory) {
        return res.status(404).json(jsend.fail('Course category not found or update failed'));
      }
      return res.json(jsend.success(courseCategory));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteCourseCategory(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      await courseCategoryService.deleteCourseCategory(id);
      return res.json(jsend.success(null, 'Course category deleted successfully'));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }
}
