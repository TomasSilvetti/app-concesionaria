-- DropForeignKey
ALTER TABLE "GeneratedDocument" DROP CONSTRAINT "GeneratedDocument_templateId_fkey";

-- AlterTable
ALTER TABLE "GeneratedDocument" ALTER COLUMN "templateId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
