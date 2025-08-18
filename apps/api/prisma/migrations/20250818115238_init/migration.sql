-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN     "popular" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerCategory" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "serviceCategoryId" TEXT NOT NULL,

    CONSTRAINT "PartnerCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerKyc" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "idType" TEXT,
    "idNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerKyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerBank" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "accountName" TEXT,
    "accountNo" TEXT,
    "ifsc" TEXT,
    "bankName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerBank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerKyc_partnerId_key" ON "PartnerKyc"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerBank_partnerId_key" ON "PartnerBank"("partnerId");

-- AddForeignKey
ALTER TABLE "PartnerCategory" ADD CONSTRAINT "PartnerCategory_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerCategory" ADD CONSTRAINT "PartnerCategory_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerKyc" ADD CONSTRAINT "PartnerKyc_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerBank" ADD CONSTRAINT "PartnerBank_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
