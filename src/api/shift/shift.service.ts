import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetShiftResponseDto,
  CreateShiftRequestDto,
  CreateShiftResponseDto,
  UpdateShiftRequestDto,
} from './dto';

@Injectable()
export class ShiftService {
  constructor(private prismaService: PrismaService) {}

  private KIND: string[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
  private DAY: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  async getAllShift(): Promise<GetShiftResponseDto[]> {
    const listShift = await this.prismaService.shift.findMany({
      select: {
        id: true,
        kind: true,
        day: true,
        numberOfStaff: true,
      },
      orderBy: [
        {
          day: 'asc',
        },
        {
          kind: 'asc',
        },
      ],
    });

    const data: GetShiftResponseDto[] = [];

    for (const shift of listShift) {
      data.push({
        id: shift.id,
        kind: this.KIND[shift.kind],
        day: this.DAY[shift.day],
        numberOfStaff: shift.numberOfStaff,
      });
    }

    return data;
  }

  async getShift(id: number): Promise<GetShiftResponseDto> {
    const shift = await this.prismaService.shift.findUnique({
      where: { id: id },
      select: {
        id: true,
        kind: true,
        day: true,
        numberOfStaff: true,
      },
    });

    if (!shift) {
      throw new BadRequestException('Shift does not exist');
    }

    return {
      id: shift.id,
      kind: this.KIND[shift.kind],
      day: this.DAY[shift.day],
      numberOfStaff: shift.numberOfStaff,
    };
  }

  async createShift(
    data: CreateShiftRequestDto,
  ): Promise<void> {
    const shift = await this.prismaService.shift.findMany({
      where: { day: data.day}
    })

    if (shift.length > 0) {
      throw new BadRequestException('Day already exists');
    }

    for(let i=0; i<data.numberOfStaff.length; i++) {
      await this.prismaService.shift.create({
        data: {
          kind: i,
          day: data.day,
          numberOfStaff: data.numberOfStaff[i],
        },
      });
    }
  }

  async updateShift(
    data: UpdateShiftRequestDto,
    id: number,
  ): Promise<CreateShiftResponseDto> {
    const shift = await this.prismaService.shift.findUnique({
      where: { id: id },
    });

    if (!shift) {
      throw new BadRequestException('Shift does not exist');
    }

    const isKindDateExist = await this.prismaService.shift.findMany({
      where: { AND: [{ kind: data.kind, day: data.day }] },
    });

    if (
      (shift.day !== data.day || shift.kind !== data.kind) &&
      isKindDateExist.length > 0
    ) {
      throw new BadRequestException('Kind-date already exists');
    }

    const newShift = await this.prismaService.shift.update({
      where: {
        id: id,
      },
      data: {
        kind: data.kind,
        day: data.day,
        numberOfStaff: data.numberOfStaff,
      },
      select: {
        id: true,
        kind: true,
        day: true,
        numberOfStaff: true,
      },
    });

    return {
      id: newShift.id,
      kind: this.KIND[newShift.kind],
      day: this.DAY[newShift.day],
      numberOfStaff: newShift.numberOfStaff,
    };
  }

  async deleteShift(id: number): Promise<void> {
    const shift = await this.prismaService.shift.findUnique({
      where: { id: id },
    });

    if (!shift) {
      throw new BadRequestException('Shift does not exist');
    }

    await this.prismaService.shift.delete({ where: { id: id } });

    const kind = shift.kind;
    const day = shift.day === 6 ? 0 : shift.day + 1; 

    const allSchedules = await this.prismaService.schedule.findMany();

    const deleteSchedules = allSchedules.filter(schedule => {
      return schedule.date.getDay() === day && schedule.shiftKind === kind;
    })

    for (const schedule of deleteSchedules) {
      await this.prismaService.schedule.delete({ where: { id: schedule.id}});
    }
  }
}
