import {
  Product,
  PricingRule,
  PricingContext,
  Discount,
  ConfigurableOption,
  RuleCondition
} from '../types/index.js';

export class PricingEngine {
  private rules: PricingRule[] = [];

  constructor(rules: PricingRule[] = []) {
    this.rules = rules.sort((a, b) => b.priority - a.priority);
  }

  addRule(rule: PricingRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  calculatePrice(context: PricingContext): {
    listPrice: number;
    netPrice: number;
    discounts: Discount[];
  } {
    const { product, quantity, configuration } = context;

    let listPrice = this.calculateBasePrice(product, configuration);
    listPrice *= quantity;

    const discounts: Discount[] = [];
    let netPrice = listPrice;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (this.evaluateConditions(rule.conditions, context)) {
        const discount = this.applyPricingAction(
          rule,
          netPrice,
          listPrice,
          context
        );

        if (discount) {
          discounts.push(discount);
          netPrice = this.applyDiscount(netPrice, discount);
        }
      }
    }

    return { listPrice, netPrice, discounts };
  }

  private calculateBasePrice(
    product: Product,
    configuration?: Record<string, any>
  ): number {
    let price = product.basePrice;

    if (product.configurableOptions && configuration) {
      for (const option of product.configurableOptions) {
        const configValue = configuration[option.id];
        if (configValue !== undefined) {
          price += this.calculateOptionPrice(option, configValue);
        }
      }
    }

    return price;
  }

  private calculateOptionPrice(
    option: ConfigurableOption,
    value: any
  ): number {
    if (typeof option.priceModifier === 'function') {
      return option.priceModifier(value);
    } else if (typeof option.priceModifier === 'number') {
      return option.priceModifier;
    }

    if (option.options) {
      const selectedOption = option.options.find(opt => opt.value === value);
      return selectedOption?.priceModifier || 0;
    }

    return 0;
  }

  private evaluateConditions(
    conditions: RuleCondition[],
    context: PricingContext
  ): boolean {
    return conditions.every(condition =>
      this.evaluateCondition(condition, context)
    );
  }

  private evaluateCondition(
    condition: RuleCondition,
    context: PricingContext
  ): boolean {
    const value = this.getFieldValue(condition.field, context);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'greaterThan':
        return value > condition.value;
      case 'lessThan':
        return value < condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) &&
               condition.value.includes(value);
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: PricingContext): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }

    return value;
  }

  private applyPricingAction(
    rule: PricingRule,
    currentPrice: number,
    listPrice: number,
    context: PricingContext
  ): Discount | null {
    const { action } = rule;
    let discountValue = 0;
    let discountType: 'percentage' | 'fixed' = 'fixed';

    const actionValue = typeof action.value === 'function'
      ? action.value(context)
      : action.value;

    switch (action.type) {
      case 'addDiscount':
        discountValue = actionValue;
        discountType = action.discountType || 'percentage';
        break;
      case 'setPrice':
        const priceDiff = currentPrice - actionValue;
        discountValue = (priceDiff / currentPrice) * 100;
        discountType = 'percentage';
        break;
      case 'multiplyPrice':
        const multipliedPrice = currentPrice * actionValue;
        discountValue = ((currentPrice - multipliedPrice) / currentPrice) * 100;
        discountType = 'percentage';
        break;
      case 'addFee':
        discountValue = -actionValue;
        discountType = 'fixed';
        break;
      default:
        return null;
    }

    if (discountValue === 0) return null;

    return {
      id: `discount-${rule.id}`,
      name: rule.name,
      type: discountType,
      value: discountValue,
      reason: `Applied rule: ${rule.name}`
    };
  }

  private applyDiscount(price: number, discount: Discount): number {
    if (discount.type === 'percentage') {
      return price * (1 - discount.value / 100);
    } else if (discount.type === 'fixed') {
      return price - discount.value;
    } else if (discount.type === 'volume') {
      return price * (1 - discount.value / 100);
    }
    return price;
  }

  getVolumeDiscount(quantity: number): number {
    if (quantity >= 100) return 15;
    if (quantity >= 50) return 10;
    if (quantity >= 20) return 5;
    return 0;
  }
}
