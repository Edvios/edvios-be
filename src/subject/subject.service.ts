import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubject(name: string) {
    try {
      const newSubject = await this.prisma.subject.create({
        data: {
          name: name,
        },
      });
      return newSubject;
    } catch (error) {
      throw error;
    }
  }
  async getAllSubjects() {
    try {
      const subjects = await this.prisma.subject.findMany();
      return subjects;
    } catch (error) {
      throw error;
    }
  }

  async deleteSubject(id: string) {
    try {
      await this.prisma.subject.delete({
        where: { id },
      });
      return { message: `Subject with ID ${id} deleted successfully` };
    } catch (error) {
      throw error;
    }
  }
}
