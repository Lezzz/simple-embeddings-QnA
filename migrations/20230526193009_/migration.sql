-- CreateTable
CREATE TABLE "RelatedObject" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelatedObject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RelatedObject" ADD CONSTRAINT "RelatedObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
