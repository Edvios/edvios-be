import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDocumentDto } from './dto';
import { AuthUser } from 'src/auth/types';
import { UserRole } from '@prisma/client';

@Injectable()
export class DocumentsService {
	constructor(private readonly prisma: PrismaService) {}

	async getDocumentsByStudent(studentId: string, user: AuthUser | undefined) {
		if (!user?.userId) {
			throw new ForbiddenException('User not authenticated');
		}

		await this.ensureStudent(studentId);

		const role = this.normalizeRole(user.role);
		if (role !== UserRole.ADMIN) {
			const assignment = await this.prisma.agentAssignment.findUnique({
				where: {
					studentId_agentId: {
						studentId,
						agentId: user.userId,
					},
				},
			});

			if (!assignment) {
				throw new ForbiddenException(
					'You do not have access to this student documents',
				);
			}
		}

		return this.prisma.document.findMany({
			where: { userId: studentId },
			orderBy: { uploadedAt: 'desc' },
		});
	}

	async createDocument(userId: string | undefined, dto: CreateDocumentDto) {
		if (!userId) {
			throw new ForbiddenException('User not authenticated');
		}

		await this.ensureStudent(userId);

		return this.prisma.document.create({
			data: {
				userId,
				name: dto.name,
				type: dto.type,
				url: dto.url,
			},
		});
	}

	async deleteOwnDocument(documentId: string, userId: string | undefined) {
		if (!userId) {
			throw new ForbiddenException('User not authenticated');
		}

		const document = await this.prisma.document.findUnique({
			where: { id: documentId },
		});

		if (!document) {
			throw new NotFoundException('Document not found');
		}

		if (document.userId !== userId) {
			throw new ForbiddenException('You can only delete your own documents');
		}

		return this.prisma.document.delete({ where: { id: documentId } });
	}

    async getOwnDocuments(userId: string | undefined) {
        if (!userId) {
            throw new ForbiddenException('User not authenticated');
        }

        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
        });
    }

	private async ensureStudent(studentId: string) {
		const student = await this.prisma.student.findUnique({
			where: { id: studentId },
		});

		if (!student) {
			throw new NotFoundException(`Student ${studentId} not found`);
		}
	}

	private normalizeRole(role: UserRole | undefined) {
		if (role === UserRole.SELECTED_AGENT) {
			return UserRole.AGENT;
		}

		return role;
	}
}
