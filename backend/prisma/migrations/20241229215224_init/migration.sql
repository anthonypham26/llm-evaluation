/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Experiment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Experiment` table. All the data in the column will be lost.
  - You are about to drop the column `aggregateScore` on the `ExperimentRun` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ExperimentRun` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExperimentRun` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the `_ExperimentToTestCase` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Experiment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llmModel` to the `ExperimentRun` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ExperimentToTestCase" DROP CONSTRAINT "_ExperimentToTestCase_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExperimentToTestCase" DROP CONSTRAINT "_ExperimentToTestCase_B_fkey";

-- AlterTable
ALTER TABLE "Experiment" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ExperimentRun" DROP COLUMN "aggregateScore",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "llmModel" TEXT NOT NULL,
ADD COLUMN     "runDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TestResult" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "_ExperimentToTestCase";

-- CreateTable
CREATE TABLE "ExperimentTestCase" (
    "id" SERIAL NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "testCaseId" INTEGER NOT NULL,

    CONSTRAINT "ExperimentTestCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExperimentTestCase" ADD CONSTRAINT "ExperimentTestCase_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentTestCase" ADD CONSTRAINT "ExperimentTestCase_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
