export * from './types/index.js';
export * from './services/PricingEngine.js';
export * from './services/QuoteService.js';
export * from './services/ApprovalService.js';
export * from './services/ProductCatalog.js';

import { PricingEngine } from './services/PricingEngine.js';
import { QuoteService } from './services/QuoteService.js';
import { ApprovalService } from './services/ApprovalService.js';
import { ProductCatalog } from './services/ProductCatalog.js';
import { PricingRule } from './types/index.js';

export class CPQSystem {
  public productCatalog: ProductCatalog;
  public pricingEngine: PricingEngine;
  public quoteService: QuoteService;
  public approvalService: ApprovalService;

  constructor(pricingRules: PricingRule[] = []) {
    this.productCatalog = new ProductCatalog();
    this.pricingEngine = new PricingEngine(pricingRules);
    this.quoteService = new QuoteService(this.pricingEngine);
    this.approvalService = new ApprovalService();
  }

  initialize(): void {
    console.log('CPQ System initialized successfully');
  }
}

export function createCPQSystem(pricingRules: PricingRule[] = []): CPQSystem {
  return new CPQSystem(pricingRules);
}
