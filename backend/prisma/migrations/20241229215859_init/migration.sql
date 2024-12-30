/*
  Warnings:

  - Added the required column `updatedAt` to the `Experiment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExperimentRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `graderType` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TestResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GraderType" AS ENUM ('EXACT_MATCH', 'LLM_MATCH', 'PARTIAL_MATCH');

-- AlterTable
ALTER TABLE "Experiment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ExperimentRun" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "graderType" "GraderType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "TestResult" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
