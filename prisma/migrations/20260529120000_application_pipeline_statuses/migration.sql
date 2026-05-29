-- Extend scholarship application workflow statuses
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'evaluation';
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'interview';
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'final_evaluation';
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'offered';
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE "ScholarshipApplicationStatus" ADD VALUE IF NOT EXISTS 'pre_departure';
