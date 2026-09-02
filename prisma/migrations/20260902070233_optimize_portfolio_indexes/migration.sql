-- CreateIndex
CREATE INDEX "CustomDomain_domain_status_idx" ON "CustomDomain"("domain", "status");

-- CreateIndex
CREATE INDEX "CustomDomain_userId_status_idx" ON "CustomDomain"("userId", "status");

-- CreateIndex
CREATE INDEX "PortfolioSettings_userId_isPublished_idx" ON "PortfolioSettings"("userId", "isPublished");
