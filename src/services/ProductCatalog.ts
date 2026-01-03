import { Product, ProductDependency } from '../types/index.js';

export class ProductCatalog {
  private products: Map<string, Product> = new Map();

  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductsByCategory(category: string): Product[] {
    return Array.from(this.products.values()).filter(
      p => p.category === category
    );
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery)
    );
  }

  validateConfiguration(
    product: Product,
    configuration: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.configurableOptions) {
      return { valid: true, errors };
    }

    for (const option of product.configurableOptions) {
      const value = configuration[option.id];

      if (option.required && (value === undefined || value === null)) {
        errors.push(`Required option '${option.name}' is missing`);
        continue;
      }

      if (value !== undefined && option.type === 'select' && option.options) {
        const validOption = option.options.find(opt => opt.value === value);
        if (!validOption) {
          errors.push(
            `Invalid value for '${option.name}': ${value}`
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  checkDependencies(
    productId: string,
    selectedProducts: string[]
  ): { valid: boolean; issues: string[] } {
    const product = this.products.get(productId);
    if (!product || !product.dependencies) {
      return { valid: true, issues: [] };
    }

    const issues: string[] = [];

    for (const dep of product.dependencies) {
      const isSelected = selectedProducts.includes(dep.productId);

      if (dep.type === 'required' && !isSelected) {
        const depProduct = this.products.get(dep.productId);
        issues.push(
          `Product '${product.name}' requires '${depProduct?.name || dep.productId}'`
        );
      } else if (dep.type === 'incompatible' && isSelected) {
        const depProduct = this.products.get(dep.productId);
        issues.push(
          `Product '${product.name}' is incompatible with '${depProduct?.name || dep.productId}'`
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  getRecommendedProducts(productId: string): Product[] {
    const product = this.products.get(productId);
    if (!product || !product.dependencies) {
      return [];
    }

    const recommended: Product[] = [];

    for (const dep of product.dependencies) {
      if (dep.type === 'recommended') {
        const recProduct = this.products.get(dep.productId);
        if (recProduct) {
          recommended.push(recProduct);
        }
      }
    }

    return recommended;
  }

  removeProduct(productId: string): boolean {
    return this.products.delete(productId);
  }
}
