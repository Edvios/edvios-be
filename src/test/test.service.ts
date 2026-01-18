import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; email: string }) {
    return this.prisma.test.create({ data });
  }

  findAll() {
    return `This action returns all test`;
  }

  findOne(id: number) {
    return `This action returns a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
