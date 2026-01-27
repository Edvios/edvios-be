import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { AuthModule } from './auth/auth.module';
import { ExampleModule } from './example/example.module';
import { StudentsModule } from './students/students.module';
import { ProgramsAndInstitutesModule } from './programs-and-institutes/programs-and-institutes.module';
import { SubjectModule } from './subject/subject.module';
import { IntakesModule } from './intakes/intakes.module';
import { AgentsModule } from './agents/agents.module';
import { ChatModule } from './chat/chat.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    TestModule,
    AuthModule,
    ExampleModule,
    StudentsModule,
    ProgramsAndInstitutesModule,
    SubjectModule,
    IntakesModule,
    AgentsModule,
    ChatModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
