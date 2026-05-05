-- CreateTable
CREATE TABLE "Spec" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Spec_projectId_idx" ON "Spec"("projectId");

-- CreateIndex
CREATE INDEX "Spec_createdAt_idx" ON "Spec"("createdAt");

-- AddForeignKey
ALTER TABLE "Spec" ADD CONSTRAINT "Spec_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
