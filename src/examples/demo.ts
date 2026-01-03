import {
  createCPQSystem,
  Product,
  PricingRule,
  Customer,
  QuoteStatus
} from '../index.js';

console.log('='.repeat(60));
console.log('CPQ SYSTEM DEMO');
console.log('='.repeat(60));
console.log();

const cpq = createCPQSystem();

console.log('1. Setting up Product Catalog...\n');

const products: Product[] = [
  {
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
      },
      {
        id: 'support-level',
        name: 'Support Level',
        type: 'select',
        required: true,
        options: [
          { id: 'basic', label: 'Basic Support', value: 'basic', priceModifier: 0 },
          { id: 'premium', label: 'Premium Support', value: 'premium', priceModifier: 2000 },
          { id: 'enterprise', label: 'Enterprise Support', value: 'enterprise', priceModifier: 5000 }
        ]
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'Cloud Storage',
    description: 'Secure cloud storage solution',
    basePrice: 500,
    category: 'infrastructure',
    sku: 'CS-002',
    configurableOptions: [
      {
        id: 'storage-size',
        name: 'Storage Size (TB)',
        type: 'select',
        required: true,
        options: [
          { id: '1tb', label: '1 TB', value: '1', priceModifier: 0 },
          { id: '5tb', label: '5 TB', value: '5', priceModifier: 1500 },
          { id: '10tb', label: '10 TB', value: '10', priceModifier: 2500 }
        ]
      }
    ]
  },
  {
    id: 'prod-003',
    name: 'Professional Services',
    description: 'Implementation and training services',
    basePrice: 15000,
    category: 'services',
    sku: 'PS-003'
  }
];

for (const product of products) {
  cpq.productCatalog.addProduct(product);
  console.log(`  Added: ${product.name} (${product.sku}) - $${product.basePrice}`);
}

console.log('\n2. Configuring Pricing Rules...\n');

const pricingRules: PricingRule[] = [
  {
    id: 'volume-discount',
    name: 'Volume Discount (10+ licenses)',
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
  },
  {
    id: 'enterprise-tier-discount',
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
  },
  {
    id: 'software-category-discount',
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
];

for (const rule of pricingRules) {
  cpq.pricingEngine.addRule(rule);
  console.log(`  Added: ${rule.name}`);
}

console.log('\n3. Creating a Quote...\n');

const customer: Customer = {
  id: 'cust-001',
  name: 'Acme Corporation',
  tier: 'enterprise',
  discountEligibility: 15
};

const product1 = cpq.productCatalog.getProduct('prod-001')!;
const product2 = cpq.productCatalog.getProduct('prod-002')!;

const quote = cpq.quoteService.createQuote({
  customerId: customer.id,
  customerName: customer.name,
  lineItems: [
    {
      product: product1,
      quantity: 15,
      configuration: {
        users: 50,
        'support-level': 'premium'
      }
    },
    {
      product: product2,
      quantity: 2,
      configuration: {
        'storage-size': '5'
      }
    }
  ],
  taxRate: 0.08,
  validityDays: 30,
  customer
});

console.log(`Quote Created: ${quote.id}`);
console.log(`Customer: ${quote.customerName}`);
console.log(`Line Items: ${quote.lineItems.length}`);
console.log();

for (const item of quote.lineItems) {
  console.log(`  ${item.product.name}:`);
  console.log(`    Quantity: ${item.quantity}`);
  console.log(`    List Price: $${item.listPrice.toFixed(2)} each`);
  console.log(`    Net Price: $${item.netPrice.toFixed(2)} each`);

  if (item.discount.length > 0) {
    console.log(`    Applied Discounts:`);
    for (const disc of item.discount) {
      console.log(`      - ${disc.name}: ${disc.value}${disc.type === 'percentage' ? '%' : ''}`);
    }
  }

  console.log(`    Subtotal: $${item.subtotal.toFixed(2)}`);
  console.log();
}

console.log(`  Subtotal: $${quote.subtotal.toFixed(2)}`);
console.log(`  Total Discount: $${quote.totalDiscount.toFixed(2)}`);
console.log(`  Tax (8%): $${quote.tax.toFixed(2)}`);
console.log(`  TOTAL: $${quote.total.toFixed(2)}`);
console.log();

console.log('4. Checking Approval Requirements...\n');

const requiredApprovals = cpq.approvalService.checkApprovalRequired(quote);

if (requiredApprovals.length > 0) {
  console.log(`  This quote requires ${requiredApprovals.length} approval(s):`);
  for (const approval of requiredApprovals) {
    console.log(`    - ${approval.description} (Approver: ${approval.approverRole})`);
  }

  cpq.approvalService.requestApprovals(quote);
  console.log(`\n  Quote status updated to: ${quote.status}`);
} else {
  console.log('  No approvals required for this quote.');
}

console.log('\n5. Processing Approvals...\n');

if (quote.approvals && quote.approvals.length > 0) {
  for (const approval of quote.approvals) {
    cpq.approvalService.approve(
      quote,
      approval.id,
      'mgr-001',
      'John Smith',
      'Approved - Valid business case'
    );
    console.log(`  ✓ Approved by ${approval.approverName}`);
  }

  console.log(`\n  Quote status updated to: ${quote.status}`);
}

console.log('\n6. Exporting Quote...\n');

const exportedQuote = cpq.quoteService.exportQuote(quote.id);
console.log(exportedQuote);

console.log('\n7. Quote Statistics...\n');

const allQuotes = cpq.quoteService.getAllQuotes();
const approvedQuotes = cpq.quoteService.getQuotesByStatus(QuoteStatus.APPROVED);

console.log(`  Total Quotes: ${allQuotes.length}`);
console.log(`  Approved Quotes: ${approvedQuotes.length}`);

console.log();
console.log('='.repeat(60));
console.log('DEMO COMPLETED SUCCESSFULLY');
console.log('='.repeat(60));
