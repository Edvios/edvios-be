import { Injectable } from '@nestjs/common';
import { CreateIntakeDto } from './dto/create-intake.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntakesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createIntakeDto: CreateIntakeDto) {
    return await this.prisma.intake.create({
      data: {
        name: createIntakeDto.name,
      },
    });
  }

  async findAll() {
    return await this.prisma.intake.findMany();
  }

  async remove(id: string) {
    return await this.prisma.intake.delete({
      where: { id },
    });
  }
}
