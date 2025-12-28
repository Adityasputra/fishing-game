-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpLastResent" TIMESTAMP(3),
ADD COLUMN     "otpResendCount" INTEGER NOT NULL DEFAULT 0;
