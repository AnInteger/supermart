-- AlterTable
ALTER TABLE "contents" ADD COLUMN     "parentContentId" TEXT;

-- CreateIndex
CREATE INDEX "contents_parentContentId_idx" ON "contents"("parentContentId");

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_parentContentId_fkey" FOREIGN KEY ("parentContentId") REFERENCES "contents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
