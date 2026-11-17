-- AlterTable
ALTER TABLE "BuyerProfile" ADD COLUMN     "questionSnapshot" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "questionVersionId" TEXT;

-- AlterTable
ALTER TABLE "AdCampaign" ADD COLUMN     "questionVersionId" TEXT;

-- AlterTable
ALTER TABLE "BuyerAcquisition" ADD COLUMN     "questionSnapshot" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "questionVersionId" TEXT;

-- AlterTable
ALTER TABLE "OwnerLead" ADD COLUMN     "questionSnapshot" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "questionVersionId" TEXT;

-- CreateTable
CREATE TABLE "QuestionSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVersion" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionResponse" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "questionVersionId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "actor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionVersion_setId_version_key" ON "QuestionVersion"("setId", "version");

-- CreateIndex
CREATE INDEX "QuestionResponse_contactId_createdAt_idx" ON "QuestionResponse"("contactId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuestionVersion" ADD CONSTRAINT "QuestionVersion_setId_fkey" FOREIGN KEY ("setId") REFERENCES "QuestionSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "QuestionSet" ("id","name","kind","updatedAt") VALUES ('questions-buyers','Compradores · original','Compradores',CURRENT_TIMESTAMP);
INSERT INTO "QuestionVersion" ("id","setId","version","snapshot") VALUES ('questions-buyers-v1','questions-buyers',1,'{"name":"Compradores · original","kind":"Compradores","version":1,"requireBudget":true,"requireFinance":true,"questions":[{"key":"intent","label":"Pretende comprar um imóvel?","eliminatory":true,"passValue":true},{"key":"area","label":"Procura na região de Aveiro?","eliminatory":true,"passValue":true},{"key":"budget","label":"Tem um orçamento de compra definido?","eliminatory":true,"passValue":true},{"key":"finance","label":"Tem crédito pré-aprovado/aprovado ou capitais próprios?","eliminatory":true,"passValue":true}]}'::jsonb);
UPDATE "BuyerProfile" SET "questionVersionId"='questions-buyers-v1', "questionSnapshot"='{"name":"Compradores · original","kind":"Compradores","version":1,"requireBudget":true,"requireFinance":true,"questions":[{"key":"intent","label":"Pretende comprar um imóvel?","eliminatory":true,"passValue":true},{"key":"area","label":"Procura na região de Aveiro?","eliminatory":true,"passValue":true},{"key":"budget","label":"Tem um orçamento de compra definido?","eliminatory":true,"passValue":true},{"key":"finance","label":"Tem crédito pré-aprovado/aprovado ou capitais próprios?","eliminatory":true,"passValue":true}]}'::jsonb;
INSERT INTO "QuestionResponse" ("id","contactId","kind","questionVersionId","snapshot","answers","actor","createdAt") SELECT 'initial-buyer-' || "id","id",'Compradores',"questionVersionId","questionSnapshot","answers",'Histórico inicial preservado',"updatedAt" FROM "BuyerProfile";
UPDATE "BuyerAcquisition" SET "questionVersionId"='questions-buyers-v1', "questionSnapshot"='{"name":"Compradores · original","kind":"Compradores","version":1,"requireBudget":true,"requireFinance":true,"questions":[{"key":"intent","label":"Pretende comprar um imóvel?","eliminatory":true,"passValue":true},{"key":"area","label":"Procura na região de Aveiro?","eliminatory":true,"passValue":true},{"key":"budget","label":"Tem um orçamento de compra definido?","eliminatory":true,"passValue":true},{"key":"finance","label":"Tem crédito pré-aprovado/aprovado ou capitais próprios?","eliminatory":true,"passValue":true}]}'::jsonb;
UPDATE "AdCampaign" SET "questionVersionId"='questions-buyers-v1' WHERE "kind"='Imóvel';

INSERT INTO "QuestionSet" ("id","name","kind","updatedAt") VALUES ('questions-owners','Angariação · original','Angariação',CURRENT_TIMESTAMP);
INSERT INTO "QuestionVersion" ("id","setId","version","snapshot") VALUES ('questions-owners-v1','questions-owners',1,'{"name":"Angariação · original","kind":"Angariação","version":1,"requireBudget":false,"requireFinance":false,"questions":[{"key":"contact","label":"Este é o seu contacto e podemos falar consigo sobre a venda?","eliminatory":true,"passValue":true},{"key":"authority","label":"É proprietário ou está autorizado a tratar da venda?","eliminatory":true,"passValue":true},{"key":"area","label":"O imóvel fica na região de Aveiro?","eliminatory":true,"passValue":true},{"key":"mediation","label":"Quer conhecer um serviço de mediação para vender o imóvel?","eliminatory":true,"passValue":true}]}'::jsonb);
UPDATE "OwnerLead" SET "questionVersionId"='questions-owners-v1', "questionSnapshot"='{"name":"Angariação · original","kind":"Angariação","version":1,"requireBudget":false,"requireFinance":false,"questions":[{"key":"contact","label":"Este é o seu contacto e podemos falar consigo sobre a venda?","eliminatory":true,"passValue":true},{"key":"authority","label":"É proprietário ou está autorizado a tratar da venda?","eliminatory":true,"passValue":true},{"key":"area","label":"O imóvel fica na região de Aveiro?","eliminatory":true,"passValue":true},{"key":"mediation","label":"Quer conhecer um serviço de mediação para vender o imóvel?","eliminatory":true,"passValue":true}]}'::jsonb;
INSERT INTO "QuestionResponse" ("id","contactId","kind","questionVersionId","snapshot","answers","actor","createdAt") SELECT 'initial-owner-' || "id","id",'Angariação',"questionVersionId","questionSnapshot","answers",'Histórico inicial preservado',"updatedAt" FROM "OwnerLead";
UPDATE "AdCampaign" SET "questionVersionId"='questions-owners-v1' WHERE "kind"='Angariação';

