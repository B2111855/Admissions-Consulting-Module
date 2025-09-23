import { Get, Post, Put, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import counselorSpecializationService from '../services/counselor-specialization.service';
import 'reflect-metadata';

@JsonController('/counselor-specializations')
export class CounselorSpecializationController {
  @Get('')
  async getAllCounselorSpecializations(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await counselorSpecializationService.getAllCounselorSpecializations(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch counselor specializations'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getCounselorSpecializationById(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      const counselorSpecialization = await counselorSpecializationService.getCounselorSpecializationById(id);
      if (!counselorSpecialization) {
        return res.status(404).json(jsend.fail('Counselor specialization not found'));
      }
      return res.json(jsend.success(counselorSpecialization));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('')
  async createCounselorSpecialization(
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const counselorSpecialization = await counselorSpecializationService.createCounselorSpecialization(data);
      if (!counselorSpecialization) {
        return res.status(400).json(jsend.fail('Failed to create counselor specialization'));
      }
      return res.status(201).json(jsend.success(counselorSpecialization));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateCounselorSpecialization(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const counselorSpecialization = await counselorSpecializationService.updateCounselorSpecialization(id, data);
      if (!counselorSpecialization) {
        return res.status(404).json(jsend.fail('Counselor specialization not found or update failed'));
      }
      return res.json(jsend.success(counselorSpecialization));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteCounselorSpecialization(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      await counselorSpecializationService.deleteCounselorSpecialization(id);
      return res.json(jsend.success(null, 'Counselor specialization deleted successfully'));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }
}