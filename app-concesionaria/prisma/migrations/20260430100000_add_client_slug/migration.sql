ALTER TABLE "Client" ADD COLUMN "slug" TEXT;
CREATE UNIQUE INDEX "Client_slug_key" ON "Client"("slug");
