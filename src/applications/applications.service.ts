import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { applicationCreateDto } from './dto/application-create.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
    constructor(private readonly prisma: PrismaService) {}

    //get all applications
    async getApplications(status?: ApplicationStatus) {
        const where = status ? { status } : {};
        const applications = await this.prisma.application.findMany({
            where,
            include: { program: true, student: true }
        });
        return applications;
    }

    //create a new application
    async createApplication(applicationCreateDto: applicationCreateDto, userId: string) {
        const newApplication = await this.prisma.application.create({
            data: {
                programId: applicationCreateDto.programId,
                additionalNotes: applicationCreateDto.additionalNotes,
                preferredIntakeId: applicationCreateDto.preferredIntakeId,
                academicYear: applicationCreateDto.academicYear,
                studentId: userId,
            },
        });
        return newApplication;
    }

    //change the status of an application
    async changeApplicationStatus(status: ApplicationStatus , id: string) {
        const updatedApplication = await this.prisma.application.update({
            where: { id },
            data: { status },
        });
        return updatedApplication;
    }

    //get application by id
    async getApplicationById(id: string, userId: string) {
        //check that the application belongs to the user
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: { program: true }
        });
        if (!application || application.studentId !== userId) {
            throw new Error('Application not found or access denied');
        }
        return application;
    }

    //get application by id (admin)
    async getApplicationByIdAdmin(id: string) {
        const application = await this.prisma.application.findUnique({
            where: { id },
            include: { program: true, student: true }
        });
        if (!application) {
            throw new Error('Application not found');
        }
        return application;
    }

    //get all applications belonging to a student
    async getApplicationsByStudentId(studentId: string) {
        const applications = await this.prisma.application.findMany({
            where: { studentId },
            include: { program: true }
        });
        return applications;
    }

    //get applications count
    async getApplicationsCount(status?: ApplicationStatus) {
        const where = status ? { status } : {};
        const count = await this.prisma.application.count({ where });
        return { count };
    }


}
