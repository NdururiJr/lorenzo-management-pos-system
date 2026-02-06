/**
 * Pricing Agent
 *
 * Specialist agent for handling pricing queries, quotes, and promotions.
 * Provides service pricing information and cost estimates.
 *
 * @module lib/agents/pricing-agent
 */

import { BaseAgent } from './base-agent';
import type {
  AgentAuth,
  AgentResponse,
  AgentCapability,
  PricingInfo,
} from './types';
import { generateRequestId, LORENZO_INFO } from './types';
import {
  getPricingByBranch,
  getPricingByGarmentType,
  calculateGarmentPrice,
} from '@/lib/db/pricing';
import type { Pricing } from '@/lib/db/schema';

/**
 * Pricing Agent - Handles pricing queries and quotes
 */
export class PricingAgent extends BaseAgent {
  readonly name = 'pricing-agent' as const;
  readonly description = 'Pricing and services specialist - provides service prices, quotes, and promotions';

  readonly capabilities: AgentCapability[] = [
    {
      action: 'getServicePricing',
      description: 'Get pricing for all services',
      requiredParams: [],
      optionalParams: ['branchId'],
      requiresAuth: false,
    },
    {
      action: 'getGarmentPrice',
      description: 'Get price for a specific garment type',
      requiredParams: ['garmentType'],
      optionalParams: ['branchId'],
      requiresAuth: false,
    },
    {
      action: 'getQuote',
      description: 'Get a price quote for multiple garments',
      requiredParams: ['items'],
      optionalParams: ['branchId'],
      requiresAuth: false,
    },
    {
      action: 'getPromotions',
      description: 'Get current promotions and special offers',
      requiredParams: [],
      requiresAuth: false,
    },
    {
      action: 'comparePrices',
      description: 'Compare prices for different service options',
      requiredParams: ['garmentType'],
      optionalParams: ['branchId'],
      requiresAuth: false,
    },
  ];

  async handle(
    action: string,
    params: Record<string, unknown>,
    auth: AgentAuth
  ): Promise<AgentResponse> {
    const requestId = generateRequestId();

    switch (action) {
      case 'getServicePricing':
        return this.getServicePricing(requestId, params, auth);
      case 'getGarmentPrice':
        return this.getGarmentPrice(requestId, params, auth);
      case 'getQuote':
        return this.getQuote(requestId, params, auth);
      case 'getPromotions':
        return this.getPromotions(requestId, params, auth);
      case 'comparePrices':
        return this.comparePrices(requestId, params, auth);
      default:
        return this.errorResponse(requestId, 'not_found', `Unknown action: ${action}`);
    }
  }

  /**
   * Get pricing for all services
   */
  private async getServicePricing(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const branchId = (params.branchId as string) || 'MAIN';
      const pricing = await getPricingByBranch(branchId);

      if (pricing.length === 0) {
        // Return default pricing info
        return this.successResponse(requestId, {
          branchId,
          note: 'Pricing varies by garment type. Contact us for a detailed quote.',
          expressService: LORENZO_INFO.expressService,
          pickupDelivery: LORENZO_INFO.pickupDelivery,
          contact: LORENZO_INFO.phone,
        }, 'Contact us for detailed pricing information.');
      }

      const pricingList = pricing.map((p) => this.mapPricingToInfo(p));

      return this.successResponse(requestId, {
        branchId,
        pricing: pricingList,
        expressService: LORENZO_INFO.expressService,
        pickupDelivery: LORENZO_INFO.pickupDelivery,
        note: 'Express service (2-hour turnaround) and pickup/delivery are FREE!',
      }, `Pricing information for ${pricingList.length} garment types`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve pricing information.');
    }
  }

  /**
   * Get price for a specific garment type
   */
  private async getGarmentPrice(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const garmentType = params.garmentType as string;
      const branchId = (params.branchId as string) || 'MAIN';

      const pricing = await getPricingByGarmentType(branchId, garmentType);

      if (!pricing) {
        return this.successResponse(requestId, {
          garmentType,
          available: false,
          message: `We don't have standard pricing for "${garmentType}". Please contact us for a custom quote.`,
          contact: LORENZO_INFO.phone,
        }, `Contact us for pricing on ${garmentType}`);
      }

      const info = this.mapPricingToInfo(pricing);

      return this.successResponse(requestId, {
        ...info,
        available: true,
        expressService: 'FREE (2-hour turnaround)',
      }, `${garmentType} pricing: Wash ${this.formatCurrency(pricing.services.wash)}, Dry Clean ${this.formatCurrency(pricing.services.dryClean)}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to retrieve garment price.');
    }
  }

  /**
   * Get a price quote for multiple garments
   */
  private async getQuote(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const items = params.items as Array<{ type: string; services: string[]; quantity?: number }>;
      const branchId = (params.branchId as string) || 'MAIN';

      if (!items || items.length === 0) {
        return this.errorResponse(requestId, 'error', 'Please specify items for the quote.');
      }

      const quoteItems: Array<{
        type: string;
        services: string[];
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      let grandTotal = 0;
      const unavailableTypes: string[] = [];

      for (const item of items) {
        const quantity = item.quantity || 1;

        try {
          const unitPrice = await calculateGarmentPrice(branchId, item.type, item.services);
          const totalPrice = unitPrice * quantity;
          grandTotal += totalPrice;

          quoteItems.push({
            type: item.type,
            services: item.services,
            quantity,
            unitPrice,
            totalPrice,
          });
        } catch {
          unavailableTypes.push(item.type);
        }
      }

      const message = unavailableTypes.length > 0
        ? `Quote calculated. Note: ${unavailableTypes.join(', ')} require custom pricing.`
        : `Total quote: ${this.formatCurrency(grandTotal)}`;

      return this.successResponse(requestId, {
        branchId,
        items: quoteItems.map((item) => ({
          ...item,
          unitPriceFormatted: this.formatCurrency(item.unitPrice),
          totalPriceFormatted: this.formatCurrency(item.totalPrice),
        })),
        unavailableTypes,
        grandTotal,
        grandTotalFormatted: this.formatCurrency(grandTotal),
        expressAvailable: true,
        expressNote: 'Express service (2-hour turnaround) available at no extra cost!',
        pickupDelivery: 'FREE',
      }, message);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to calculate quote.');
    }
  }

  /**
   * Get current promotions
   */
  private async getPromotions(
    requestId: string,
    _params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    // Static promotions - in a real system, these would come from a database
    const promotions = [
      {
        id: 'express-free',
        title: 'FREE Express Service',
        description: 'Get your clothes back in just 2 hours at no extra cost!',
        validUntil: null,
        terms: 'Available at all branches during operating hours',
      },
      {
        id: 'free-delivery',
        title: 'FREE Pickup & Delivery',
        description: 'We come to you! Free pickup and delivery across Nairobi.',
        validUntil: null,
        terms: 'Minimum order value may apply',
      },
      {
        id: 'first-order',
        title: 'Welcome Offer',
        description: 'New customers enjoy 10% off their first order!',
        validUntil: null,
        terms: 'Valid for first-time customers only',
      },
    ];

    return this.successResponse(requestId, {
      promotions,
      count: promotions.length,
      contact: LORENZO_INFO.phone,
      whatsapp: LORENZO_INFO.whatsapp,
    }, `We have ${promotions.length} active promotions available!`);
  }

  /**
   * Compare prices for different service options
   */
  private async comparePrices(
    requestId: string,
    params: Record<string, unknown>,
    _auth: AgentAuth
  ): Promise<AgentResponse> {
    try {
      const garmentType = params.garmentType as string;
      const branchId = (params.branchId as string) || 'MAIN';

      const pricing = await getPricingByGarmentType(branchId, garmentType);

      if (!pricing) {
        return this.successResponse(requestId, {
          garmentType,
          available: false,
          message: `Pricing comparison not available for "${garmentType}". Please contact us.`,
          contact: LORENZO_INFO.phone,
        });
      }

      const comparisons = [
        {
          option: 'Wash Only',
          services: ['wash'],
          price: pricing.services.wash,
          priceFormatted: this.formatCurrency(pricing.services.wash),
        },
        {
          option: 'Dry Clean Only',
          services: ['dryclean'],
          price: pricing.services.dryClean,
          priceFormatted: this.formatCurrency(pricing.services.dryClean),
        },
        {
          option: 'Wash + Iron',
          services: ['wash', 'iron'],
          price: pricing.services.wash + pricing.services.iron,
          priceFormatted: this.formatCurrency(pricing.services.wash + pricing.services.iron),
        },
        {
          option: 'Dry Clean + Iron',
          services: ['dryclean', 'iron'],
          price: pricing.services.dryClean + pricing.services.iron,
          priceFormatted: this.formatCurrency(pricing.services.dryClean + pricing.services.iron),
        },
        {
          option: 'Wash + Iron + Starch',
          services: ['wash', 'iron', 'starch'],
          price: pricing.services.wash + pricing.services.iron + pricing.services.starch,
          priceFormatted: this.formatCurrency(
            pricing.services.wash + pricing.services.iron + pricing.services.starch
          ),
        },
      ];

      // Filter out options with zero price (starch not applicable)
      const validComparisons = comparisons.filter((c) => c.price > 0);

      return this.successResponse(requestId, {
        garmentType,
        comparisons: validComparisons,
        recommendation: 'Most customers choose Wash + Iron for everyday garments.',
        expressNote: 'All options available with FREE express service (2-hour turnaround)!',
      }, `Price comparison for ${garmentType}`);
    } catch {
      return this.errorResponse(requestId, 'error', 'Failed to compare prices.');
    }
  }

  /**
   * Map pricing to info object
   */
  private mapPricingToInfo(pricing: Pricing): PricingInfo {
    return {
      garmentType: pricing.garmentType,
      services: {
        wash: pricing.services.wash,
        dryClean: pricing.services.dryClean,
        iron: pricing.services.iron,
        starch: pricing.services.starch,
      },
    };
  }
}

/**
 * Create and export a singleton instance
 */
export const pricingAgent = new PricingAgent();
