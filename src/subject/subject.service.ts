import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubject(name: string) {
    const newSubject = await this.prisma.subject.create({
      data: {
        name: name,
      },
    });
    return newSubject;
  }
  async getAllSubjects() {
    const subjects = await this.prisma.subject.findMany();
    return subjects;
  }

  async deleteSubject(id: string) {
    await this.prisma.subject.delete({
      where: { id },
    });
    return { message: `Subject with ID ${id} deleted successfully` };
  }
}
