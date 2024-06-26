import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
