import { Injectable } from '@nestjs/common';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntakesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createIntakeDto: CreateIntakeDto) {
    try {
      return await this.prisma.intake.create({
        data: {
          name: createIntakeDto.name,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.intake.findMany();
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.intake.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
