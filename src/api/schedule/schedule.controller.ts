import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateScheduleRequestDto } from './dto';

@Controller('schedule')
@ApiTags('Schedule')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get('statistic')
  @ApiOperation({ summary: 'Get statistic' })
  async getStatistic() {
    const data = await this.scheduleService.getStatistic();
    return { data, message: 'Success' };
  }

  @Get('today')
  @ApiOperation({ summary: 'Get schedule today' })
  async getScheduleToday() {
    const data = await this.scheduleService.getScheduleToday();
    return { data, message: 'Success' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by historyId' })
  async getSchedule(@Param('id') id: string) {
    const data = await this.scheduleService.getSchedule(+id);
    return { data, message: 'Success' };
  }

  @Post()
  @ApiOperation({ summary: 'Create new schedule' })
  async createSchedule(@Body() body: CreateScheduleRequestDto) {
    await this.scheduleService.createSchedule(body);
    return { message: 'Success' };
  }

  @Post(':id')
  @ApiOperation({ summary: 'Update schedule' })
  async updateSchedule(@Param('id') id: string, @Body() body: CreateScheduleRequestDto) {
    await this.scheduleService.updateSchedule(+id, body);
    return { message: 'Success' };
  }
}
