/*
  Warnings:

  - You are about to drop the column `examples` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `instruction` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `setupGuide` on the `contents` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `contents` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "contents_type_status_idx";

-- AlterTable
ALTER TABLE "contents" DROP COLUMN "examples",
DROP COLUMN "instruction",
DROP COLUMN "setupGuide",
DROP COLUMN "type",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "license" TEXT NOT NULL DEFAULT 'MIT-0',
ADD COLUMN     "version" TEXT NOT NULL DEFAULT 'v1.0.0',
ADD COLUMN     "versionNotes" TEXT;

-- DropEnum
DROP TYPE "ContentType";

-- CreateIndex
CREATE INDEX "contents_status_idx" ON "contents"("status");
