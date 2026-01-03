import {
  Quote,
  Approval,
  ApprovalRule,
  QuoteStatus
} from '../types/index.js';
import { randomUUID } from 'crypto';

export class ApprovalService {
  private approvalRules: ApprovalRule[] = [];

  constructor(rules: ApprovalRule[] = []) {
    this.approvalRules = rules;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    if (this.approvalRules.length === 0) {
      this.approvalRules = [
        {
          id: 'discount-over-20',
          condition: (quote: Quote) => {
            const discountPercentage = (quote.totalDiscount /
              (quote.subtotal + quote.totalDiscount)) * 100;
            return discountPercentage > 20;
          },
          approverRole: 'sales-manager',
          description: 'Requires approval if discount exceeds 20%'
        },
        {
          id: 'total-over-50k',
          condition: (quote: Quote) => quote.total > 50000,
          approverRole: 'sales-director',
          description: 'Requires approval if total exceeds $50,000'
        },
        {
          id: 'total-over-100k',
          condition: (quote: Quote) => quote.total > 100000,
          approverRole: 'vp-sales',
          description: 'Requires approval if total exceeds $100,000'
        }
      ];
    }
  }

  addRule(rule: ApprovalRule): void {
    this.approvalRules.push(rule);
  }

  checkApprovalRequired(quote: Quote): ApprovalRule[] {
    const requiredApprovals: ApprovalRule[] = [];

    for (const rule of this.approvalRules) {
      if (rule.condition(quote)) {
        requiredApprovals.push(rule);
      }
    }

    return requiredApprovals;
  }

  requestApprovals(quote: Quote): Quote {
    const requiredApprovals = this.checkApprovalRequired(quote);

    if (requiredApprovals.length > 0) {
      quote.approvals = requiredApprovals.map(rule => ({
        id: randomUUID(),
        approverId: '',
        approverName: rule.approverRole,
        status: 'pending',
        reason: rule.description
      }));

      quote.status = QuoteStatus.PENDING_APPROVAL;
    }

    return quote;
  }

  approve(
    quote: Quote,
    approvalId: string,
    approverId: string,
    approverName: string,
    reason?: string
  ): Quote | null {
    const approval = quote.approvals?.find(a => a.id === approvalId);
    if (!approval) return null;

    approval.status = 'approved';
    approval.approverId = approverId;
    approval.approverName = approverName;
    approval.reason = reason;
    approval.timestamp = new Date();

    const allApproved = quote.approvals?.every(a => a.status === 'approved');
    if (allApproved) {
      quote.status = QuoteStatus.APPROVED;
    }

    return quote;
  }

  reject(
    quote: Quote,
    approvalId: string,
    approverId: string,
    approverName: string,
    reason: string
  ): Quote | null {
    const approval = quote.approvals?.find(a => a.id === approvalId);
    if (!approval) return null;

    approval.status = 'rejected';
    approval.approverId = approverId;
    approval.approverName = approverName;
    approval.reason = reason;
    approval.timestamp = new Date();

    quote.status = QuoteStatus.REJECTED;

    return quote;
  }

  getPendingApprovals(quote: Quote): Approval[] {
    return quote.approvals?.filter(a => a.status === 'pending') || [];
  }

  isFullyApproved(quote: Quote): boolean {
    if (!quote.approvals || quote.approvals.length === 0) {
      return this.checkApprovalRequired(quote).length === 0;
    }

    return quote.approvals.every(a => a.status === 'approved');
  }

  hasRejections(quote: Quote): boolean {
    return quote.approvals?.some(a => a.status === 'rejected') || false;
  }
}
