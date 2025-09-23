import { Get, Post, Put, Delete, JsonController, QueryParam, Param, Body, Res } from 'routing-controllers';
import jsend from '../jsend';
import counselorKpiTargetService from '../services/counselor-kpi-target.service';
import 'reflect-metadata';

@JsonController('/counselor-kpi-targets')
export class CounselorKpiTargetController {
  @Get('')
  async getAllCounselorKpiTargets(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Res() res: any
  ) {
    try {
      const result = await counselorKpiTargetService.getAllCounselorKpiTargets(page, limit);
      if (!result) {
        return res.status(500).json(jsend.error('Failed to fetch counselor KPI targets'));
      }
      return res.json(jsend.success(result));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/counselor/:counselorId')
  async getKpiTargetsByCounselorId(
    @Param('counselorId') counselorId: number,
    @Res() res: any
  ) {
    try {
      const kpiTargets = await counselorKpiTargetService.getKpiTargetsByCounselorId(counselorId);
      if (!kpiTargets) {
        return res.status(500).json(jsend.error('Failed to fetch KPI targets for counselor'));
      }
      return res.json(jsend.success(kpiTargets));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Get('/:id')
  async getCounselorKpiTargetById(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      const counselorKpiTarget = await counselorKpiTargetService.getCounselorKpiTargetById(id);
      if (!counselorKpiTarget) {
        return res.status(404).json(jsend.fail('Counselor KPI target not found'));
      }
      return res.json(jsend.success(counselorKpiTarget));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Post('')
  async createCounselorKpiTarget(
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const counselorKpiTarget = await counselorKpiTargetService.createCounselorKpiTarget(data);
      if (!counselorKpiTarget) {
        return res.status(400).json(jsend.fail('Failed to create counselor KPI target'));
      }
      return res.status(201).json(jsend.success(counselorKpiTarget));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Put('/:id')
  async updateCounselorKpiTarget(
    @Param('id') id: number,
    @Body() data: any,
    @Res() res: any
  ) {
    try {
      const counselorKpiTarget = await counselorKpiTargetService.updateCounselorKpiTarget(id, data);
      if (!counselorKpiTarget) {
        return res.status(404).json(jsend.fail('Counselor KPI target not found or update failed'));
      }
      return res.json(jsend.success(counselorKpiTarget));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }

  @Delete('/:id')
  async deleteCounselorKpiTarget(
    @Param('id') id: number,
    @Res() res: any
  ) {
    try {
      await counselorKpiTargetService.deleteCounselorKpiTarget(id);
      return res.json(jsend.success(null, 'Counselor KPI target deleted successfully'));
    } catch (e: any) {
      return res.status(500).json(jsend.error(e.message || 'Internal server error'));
    }
  }
}
