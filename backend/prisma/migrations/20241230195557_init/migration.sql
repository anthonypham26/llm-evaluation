/*
  Warnings:

  - You are about to drop the column `graderType` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "graderType";

-- DropEnum
DROP TYPE "GraderType";
