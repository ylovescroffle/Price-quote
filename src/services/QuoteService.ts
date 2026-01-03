import {
  Quote,
  QuoteLineItem,
  Product,
  QuoteStatus,
  Customer,
  Discount,
  PricingContext
} from '../types/index.js';
import { PricingEngine } from './PricingEngine.js';
import { randomUUID } from 'crypto';

export interface CreateQuoteRequest {
  customerId: string;
  customerName: string;
  lineItems: {
    product: Product;
    quantity: number;
    configuration?: Record<string, any>;
  }[];
  taxRate?: number;
  validityDays?: number;
  customer?: Customer;
}

export class QuoteService {
  private pricingEngine: PricingEngine;
  private quotes: Map<string, Quote> = new Map();

  constructor(pricingEngine: PricingEngine) {
    this.pricingEngine = pricingEngine;
  }

  createQuote(request: CreateQuoteRequest): Quote {
    const quoteId = randomUUID();
    const lineItems: QuoteLineItem[] = [];
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of request.lineItems) {
      const context: PricingContext = {
        product: item.product,
        quantity: item.quantity,
        configuration: item.configuration,
        customer: request.customer
      };

      const pricing = this.pricingEngine.calculatePrice(context);

      const lineItem: QuoteLineItem = {
        id: randomUUID(),
        product: item.product,
        quantity: item.quantity,
        configuration: item.configuration,
        listPrice: pricing.listPrice / item.quantity,
        netPrice: pricing.netPrice / item.quantity,
        discount: pricing.discounts,
        subtotal: pricing.netPrice
      };

      lineItems.push(lineItem);
      subtotal += pricing.netPrice;
      totalDiscount += (pricing.listPrice - pricing.netPrice);
    }

    const taxRate = request.taxRate || 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (request.validityDays || 30));

    const quote: Quote = {
      id: quoteId,
      customerId: request.customerId,
      customerName: request.customerName,
      lineItems,
      subtotal,
      totalDiscount,
      tax,
      total,
      status: QuoteStatus.DRAFT,
      createdAt: new Date(),
      expiresAt,
      approvals: []
    };

    this.quotes.set(quoteId, quote);
    return quote;
  }

  getQuote(quoteId: string): Quote | undefined {
    return this.quotes.get(quoteId);
  }

  updateQuoteStatus(quoteId: string, status: QuoteStatus): Quote | null {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;

    quote.status = status;
    return quote;
  }

  addLineItem(
    quoteId: string,
    product: Product,
    quantity: number,
    configuration?: Record<string, any>,
    customer?: Customer
  ): Quote | null {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;

    const context: PricingContext = {
      product,
      quantity,
      configuration,
      customer
    };

    const pricing = this.pricingEngine.calculatePrice(context);

    const lineItem: QuoteLineItem = {
      id: randomUUID(),
      product,
      quantity,
      configuration,
      listPrice: pricing.listPrice / quantity,
      netPrice: pricing.netPrice / quantity,
      discount: pricing.discounts,
      subtotal: pricing.netPrice
    };

    quote.lineItems.push(lineItem);
    this.recalculateQuote(quote);

    return quote;
  }

  removeLineItem(quoteId: string, lineItemId: string): Quote | null {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;

    quote.lineItems = quote.lineItems.filter(item => item.id !== lineItemId);
    this.recalculateQuote(quote);

    return quote;
  }

  applyAdditionalDiscount(
    quoteId: string,
    discount: Discount
  ): Quote | null {
    const quote = this.quotes.get(quoteId);
    if (!quote) return null;

    for (const lineItem of quote.lineItems) {
      lineItem.discount.push(discount);

      if (discount.type === 'percentage') {
        lineItem.netPrice = lineItem.netPrice * (1 - discount.value / 100);
      } else if (discount.type === 'fixed') {
        const perItemDiscount = discount.value / quote.lineItems.length;
        lineItem.netPrice = lineItem.netPrice - perItemDiscount;
      }

      lineItem.subtotal = lineItem.netPrice * lineItem.quantity;
    }

    this.recalculateQuote(quote);
    return quote;
  }

  private recalculateQuote(quote: Quote): void {
    quote.subtotal = quote.lineItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const totalListPrice = quote.lineItems.reduce(
      (sum, item) => sum + (item.listPrice * item.quantity),
      0
    );

    quote.totalDiscount = totalListPrice - quote.subtotal;
    quote.total = quote.subtotal + quote.tax;
  }

  getAllQuotes(): Quote[] {
    return Array.from(this.quotes.values());
  }

  getQuotesByCustomer(customerId: string): Quote[] {
    return Array.from(this.quotes.values()).filter(
      quote => quote.customerId === customerId
    );
  }

  getQuotesByStatus(status: QuoteStatus): Quote[] {
    return Array.from(this.quotes.values()).filter(
      quote => quote.status === status
    );
  }

  exportQuote(quoteId: string): string {
    const quote = this.quotes.get(quoteId);
    if (!quote) return '';

    return this.formatQuoteAsText(quote);
  }

  private formatQuoteAsText(quote: Quote): string {
    let output = '';
    output += '='.repeat(60) + '\n';
    output += `QUOTE #${quote.id}\n`;
    output += '='.repeat(60) + '\n';
    output += `Customer: ${quote.customerName}\n`;
    output += `Date: ${quote.createdAt.toLocaleDateString()}\n`;
    output += `Expires: ${quote.expiresAt.toLocaleDateString()}\n`;
    output += `Status: ${quote.status}\n`;
    output += '-'.repeat(60) + '\n\n';

    output += 'LINE ITEMS:\n';
    output += '-'.repeat(60) + '\n';

    for (const item of quote.lineItems) {
      output += `${item.product.name} (${item.product.sku})\n`;
      output += `  Quantity: ${item.quantity}\n`;
      output += `  List Price: $${item.listPrice.toFixed(2)} each\n`;
      output += `  Net Price: $${item.netPrice.toFixed(2)} each\n`;

      if (item.discount.length > 0) {
        output += `  Discounts:\n`;
        for (const discount of item.discount) {
          output += `    - ${discount.name}: `;
          if (discount.type === 'percentage') {
            output += `${discount.value}%\n`;
          } else {
            output += `$${discount.value.toFixed(2)}\n`;
          }
        }
      }

      output += `  Subtotal: $${item.subtotal.toFixed(2)}\n\n`;
    }

    output += '-'.repeat(60) + '\n';
    output += `Subtotal: $${quote.subtotal.toFixed(2)}\n`;
    output += `Total Discount: $${quote.totalDiscount.toFixed(2)}\n`;
    output += `Tax: $${quote.tax.toFixed(2)}\n`;
    output += `TOTAL: $${quote.total.toFixed(2)}\n`;
    output += '='.repeat(60) + '\n';

    return output;
  }
}
