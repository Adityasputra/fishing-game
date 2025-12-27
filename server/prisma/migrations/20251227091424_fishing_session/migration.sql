-- CreateTable
CREATE TABLE "FishingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fishType" TEXT,
    "biteAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FishingSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FishingSession" ADD CONSTRAINT "FishingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
