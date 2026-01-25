-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentSize" INTEGER,
ADD COLUMN     "attachmentType" TEXT,
ADD COLUMN     "attachmentUrl" TEXT;
