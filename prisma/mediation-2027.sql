-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Direto',
    "zones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "propertyTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "timeframe" TEXT NOT NULL DEFAULT 'Por confirmar',
    "financeStatus" TEXT NOT NULL DEFAULT 'Por confirmar',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "screening" TEXT NOT NULL DEFAULT 'Pendente',
    "stage" TEXT NOT NULL DEFAULT 'Novo',
    "assignedTo" TEXT NOT NULL DEFAULT 'Hugo',
    "notes" TEXT NOT NULL DEFAULT '',
    "callValidatedAt" TIMESTAMP(3),
    "callValidatedBy" TEXT,
    "qualifiedAt" TIMESTAMP(3),
    "nextContactAt" TIMESTAMP(3),
    "propertyId" TEXT,
    "cpcvAt" TIMESTAMP(3),
    "depositConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "soldAt" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "attribution" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerageProperty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "business" TEXT NOT NULL DEFAULT 'Mediação',
    "stage" TEXT NOT NULL DEFAULT 'Angariação',
    "ownerName" TEXT NOT NULL DEFAULT '',
    "ownerPhone" TEXT NOT NULL DEFAULT '',
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT NOT NULL DEFAULT 'Hugo',
    "legacyLeadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerageProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralPartner" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL DEFAULT 'Profissional',
    "specialty" TEXT NOT NULL DEFAULT '',
    "reward" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "reward" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyLaunch" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Planeado',
    "notes" TEXT NOT NULL DEFAULT '',
    "contactedIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyLaunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaConversion" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT,
    "ownerId" TEXT,
    "acquisitionId" TEXT,
    "campaignId" TEXT NOT NULL,
    "pixelId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "propertyId" TEXT,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "pixelId" TEXT NOT NULL DEFAULT '',
    "tokenEnv" TEXT NOT NULL DEFAULT '',
    "testCode" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerAcquisition" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "attribution" JSONB NOT NULL DEFAULT '{}',
    "screening" TEXT NOT NULL DEFAULT 'Pendente',
    "submission" JSONB NOT NULL DEFAULT '{}',
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerAcquisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "zone" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "askingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "screening" TEXT NOT NULL DEFAULT 'Pendente',
    "stage" TEXT NOT NULL DEFAULT 'Novo',
    "notes" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT NOT NULL DEFAULT 'Hugo',
    "campaignId" TEXT,
    "propertyId" TEXT,
    "callValidatedAt" TIMESTAMP(3),
    "qualifiedAt" TIMESTAMP(3),
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "consentAt" TIMESTAMP(3),
    "consentVersion" TEXT,
    "attribution" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediationAudit" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_phone_key" ON "BuyerProfile"("phone");

-- CreateIndex
CREATE INDEX "BuyerProfile_stage_screening_idx" ON "BuyerProfile"("stage", "screening");

-- CreateIndex
CREATE INDEX "BuyerProfile_source_createdAt_idx" ON "BuyerProfile"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerageProperty_legacyLeadId_key" ON "BrokerageProperty"("legacyLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralPartner_code_key" ON "ReferralPartner"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_buyerId_key" ON "Referral"("buyerId");

-- CreateIndex
CREATE INDEX "MetaConversion_status_nextAttempt_idx" ON "MetaConversion"("status", "nextAttempt");

-- CreateIndex
CREATE UNIQUE INDEX "AdCampaign_slug_key" ON "AdCampaign"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerAcquisition_buyerId_campaignId_key" ON "BuyerAcquisition"("buyerId", "campaignId");

-- CreateIndex
CREATE INDEX "OwnerLead_phone_campaignId_idx" ON "OwnerLead"("phone", "campaignId");

-- CreateIndex
CREATE INDEX "MediationAudit_entityId_createdAt_idx" ON "MediationAudit"("entityId", "createdAt");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ReferralPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyLaunch" ADD CONSTRAINT "PropertyLaunch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "BrokerageProperty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConversion" ADD CONSTRAINT "MetaConversion_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConversion" ADD CONSTRAINT "MetaConversion_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "OwnerLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConversion" ADD CONSTRAINT "MetaConversion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConversion" ADD CONSTRAINT "MetaConversion_acquisitionId_fkey" FOREIGN KEY ("acquisitionId") REFERENCES "BuyerAcquisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerAcquisition" ADD CONSTRAINT "BuyerAcquisition_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerAcquisition" ADD CONSTRAINT "BuyerAcquisition_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerLead" ADD CONSTRAINT "OwnerLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
