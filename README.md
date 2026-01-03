# CPQ System (Configure, Price, Quote)

A comprehensive TypeScript-based Configure, Price, Quote (CPQ) system for managing product configurations, pricing rules, quote generation, and approval workflows.

## Features

- **Product Catalog Management**: Manage products with configurable options and dependencies
- **Dynamic Pricing Engine**: Rule-based pricing with support for discounts, volume pricing, and customer tiers
- **Quote Generation**: Create and manage quotes with multiple line items
- **Approval Workflows**: Automated approval routing based on configurable rules
- **Configuration Validation**: Ensure product configurations meet requirements
- **Discount Management**: Apply percentage, fixed, and volume-based discounts
- **Quote Export**: Export quotes in text format

## Installation

```bash
npm install
```

## Quick Start

```typescript
import { createCPQSystem, Product } from './src/index.js';

// Initialize the CPQ system
const cpq = createCPQSystem();

// Add a product to the catalog
const product: Product = {
  id: 'prod-001',
  name: 'Enterprise Software License',
  description: 'Annual enterprise software license',
  basePrice: 10000,
  category: 'software',
  sku: 'ESL-001',
  configurableOptions: [
    {
      id: 'users',
      name: 'Number of Users',
      type: 'number',
      required: true,
      priceModifier: (value: number) => value * 100
    }
  ]
};

cpq.productCatalog.addProduct(product);

// Create a quote
const quote = cpq.quoteService.createQuote({
  customerId: 'cust-001',
  customerName: 'Acme Corporation',
  lineItems: [
    {
      product: product,
      quantity: 10,
      configuration: { users: 50 }
    }
  ],
  taxRate: 0.08,
  validityDays: 30
});

console.log(`Quote Total: $${quote.total.toFixed(2)}`);
```

## Architecture

### Core Components

#### 1. Product Catalog

Manages the product inventory with support for:
- Configurable options (select, multiselect, text, number, boolean)
- Product dependencies (required, recommended, incompatible)
- Configuration validation
- Product search and filtering

```typescript
const catalog = cpq.productCatalog;

// Add product
catalog.addProduct(product);

// Search products
const results = catalog.searchProducts('software');

// Validate configuration
const validation = catalog.validateConfiguration(product, config);
```

#### 2. Pricing Engine

Rule-based pricing system supporting:
- Multiple pricing rules with priorities
- Conditional rule execution
- Dynamic price calculations
- Volume discounts
- Customer tier pricing

```typescript
const rule: PricingRule = {
  id: 'volume-discount',
  name: 'Volume Discount',
  priority: 10,
  conditions: [
    { field: 'quantity', operator: 'greaterThan', value: 10 }
  ],
  action: {
    type: 'addDiscount',
    value: 10,
    discountType: 'percentage'
  },
  enabled: true
};

cpq.pricingEngine.addRule(rule);
```

#### 3. Quote Service

Manages quote lifecycle:
- Create and update quotes
- Add/remove line items
- Apply discounts
- Export quotes
- Filter by customer or status

```typescript
// Create quote
const quote = cpq.quoteService.createQuote(request);

// Add line item
cpq.quoteService.addLineItem(quoteId, product, quantity, config);

// Apply discount
cpq.quoteService.applyAdditionalDiscount(quoteId, discount);

// Export quote
const text = cpq.quoteService.exportQuote(quoteId);
```

#### 4. Approval Service

Automated approval workflow:
- Configurable approval rules
- Multi-level approvals
- Approval tracking
- Auto-routing based on quote characteristics

```typescript
// Check if approval needed
const required = cpq.approvalService.checkApprovalRequired(quote);

// Request approvals
cpq.approvalService.requestApprovals(quote);

// Approve
cpq.approvalService.approve(quote, approvalId, approverId, name);

// Reject
cpq.approvalService.reject(quote, approvalId, approverId, name, reason);
```

## Data Models

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  sku: string;
  configurableOptions?: ConfigurableOption[];
  dependencies?: ProductDependency[];
}
```

### Quote

```typescript
interface Quote {
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
}
```

### Pricing Rule

```typescript
interface PricingRule {
  id: string;
  name: string;
  priority: number;
  conditions: RuleCondition[];
  action: PricingAction;
  enabled: boolean;
}
```

## Pricing Rule Examples

### Volume Discount

```typescript
{
  id: 'volume-discount',
  name: 'Volume Discount (10+ units)',
  priority: 10,
  conditions: [
    { field: 'quantity', operator: 'greaterThan', value: 10 }
  ],
  action: {
    type: 'addDiscount',
    value: 10,
    discountType: 'percentage'
  },
  enabled: true
}
```

### Customer Tier Pricing

```typescript
{
  id: 'enterprise-discount',
  name: 'Enterprise Customer Discount',
  priority: 20,
  conditions: [
    { field: 'customer.tier', operator: 'equals', value: 'enterprise' }
  ],
  action: {
    type: 'addDiscount',
    value: 15,
    discountType: 'percentage'
  },
  enabled: true
}
```

### Category-Based Pricing

```typescript
{
  id: 'software-promo',
  name: 'Software Category Promotion',
  priority: 5,
  conditions: [
    { field: 'product.category', operator: 'equals', value: 'software' }
  ],
  action: {
    type: 'addDiscount',
    value: 5,
    discountType: 'percentage'
  },
  enabled: true
}
```

## Approval Rules

Default approval rules are configured for:

1. **Discount > 20%**: Requires sales manager approval
2. **Total > $50,000**: Requires sales director approval
3. **Total > $100,000**: Requires VP of Sales approval

Custom approval rules can be added:

```typescript
const customRule: ApprovalRule = {
  id: 'custom-rule',
  condition: (quote) => quote.total > 200000,
  approverRole: 'ceo',
  description: 'CEO approval required for quotes over $200k'
};

cpq.approvalService.addRule(customRule);
```

## Running the Demo

```bash
npm test
```

This will run a comprehensive demo showcasing:
- Product catalog setup
- Pricing rule configuration
- Quote creation with multiple line items
- Discount application
- Approval workflow
- Quote export

## Development

```bash
# Build the project
npm run build

# Run in development mode
npm run dev
```

## Project Structure

```
src/
├── types/
│   └── index.ts              # Core type definitions
├── services/
│   ├── PricingEngine.ts      # Pricing calculation engine
│   ├── QuoteService.ts       # Quote management
│   ├── ApprovalService.ts    # Approval workflows
│   └── ProductCatalog.ts     # Product management
├── examples/
│   └── demo.ts               # Comprehensive demo
└── index.ts                  # Main exports
```

## Use Cases

1. **Software Licensing**: Configure user counts, support levels, and modules
2. **Manufacturing**: Configure product variants, colors, sizes, and quantities
3. **Professional Services**: Package services with hourly rates and project scopes
4. **SaaS Products**: Tier-based pricing with feature toggles
5. **Hardware Sales**: Bundle products with accessories and warranties

## Extension Points

The system is designed to be extensible:

- **Custom Pricing Actions**: Add new pricing action types
- **Rule Conditions**: Implement custom condition operators
- **Approval Logic**: Define complex approval workflows
- **Quote Export**: Add PDF, Excel, or other export formats
- **Integration**: Connect to CRM, ERP, or billing systems

## License

MIT
