export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  sku: string;
  configurableOptions?: ConfigurableOption[];
  dependencies?: ProductDependency[];
}

export interface ConfigurableOption {
  id: string;
  name: string;
  type: 'select' | 'multiselect' | 'text' | 'number' | 'boolean';
  required: boolean;
  options?: OptionValue[];
  priceModifier?: number | ((value: any) => number);
}

export interface OptionValue {
  id: string;
  label: string;
  value: any;
  priceModifier?: number;
}

export interface ProductDependency {
  productId: string;
  type: 'required' | 'recommended' | 'incompatible';
}

export interface QuoteLineItem {
  id: string;
  product: Product;
  quantity: number;
  configuration?: Record<string, any>;
  listPrice: number;
  netPrice: number;
  discount: Discount[];
  subtotal: number;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  createdAt: Date;
  expiresAt: Date;
  approvals?: Approval[];
  metadata?: Record<string, any>;
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED'
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'volume';
  value: number;
  reason?: string;
  requiresApproval?: boolean;
  approvalThreshold?: number;
}

export interface PricingRule {
  id: string;
  name: string;
  priority: number;
  conditions: RuleCondition[];
  action: PricingAction;
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: any;
}

export interface PricingAction {
  type: 'setPrice' | 'addDiscount' | 'multiplyPrice' | 'addFee';
  value: number | ((context: PricingContext) => number);
  discountType?: 'percentage' | 'fixed';
}

export interface PricingContext {
  product: Product;
  quantity: number;
  configuration?: Record<string, any>;
  customer?: Customer;
  quoteTotal?: number;
}

export interface Customer {
  id: string;
  name: string;
  tier: 'standard' | 'premium' | 'enterprise';
  discountEligibility?: number;
}

export interface Approval {
  id: string;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  timestamp?: Date;
}

export interface ApprovalRule {
  id: string;
  condition: (quote: Quote) => boolean;
  approverRole: string;
  description: string;
}
