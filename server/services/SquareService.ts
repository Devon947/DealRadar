// Square Payment Service for DealRadar
// This service handles Square payment processing for subscriptions

interface PaymentResult {
  success: boolean;
  payment?: any;
  receiptUrl?: string;
  error?: string;
  code?: string;
}

interface CustomerResult {
  success: boolean;
  customer?: any;
  error?: string;
  code?: string;
}

class SquareService {
  private accessToken: string;
  private applicationId: string;
  private isProduction: boolean;
  
  constructor() {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const applicationId = process.env.SQUARE_APPLICATION_ID;
    
    if (!accessToken || !applicationId) {
      throw new Error('Square credentials not found in environment variables');
    }
    
    this.accessToken = accessToken;
    this.applicationId = applicationId;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Create a payment for subscription
   * For now, this is a mock implementation since Square SDK integration is complex
   */
  async createSubscriptionPayment(params: {
    sourceId: string; // Payment token from frontend
    amount: number; // Amount in cents
    currency: string;
    customerId?: string;
    orderId?: string;
    note?: string;
  }): Promise<PaymentResult> {
    try {
      // Mock payment processing for development
      // In production, this would make actual API calls to Square
      
      console.log('Processing Square payment:', {
        amount: params.amount,
        currency: params.currency,
        sourceId: params.sourceId,
        customerId: params.customerId,
        note: params.note
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful payment
      const mockPayment = {
        id: `payment_${Math.random().toString(36).substr(2, 9)}`,
        status: 'COMPLETED',
        amount_money: {
          amount: params.amount,
          currency: params.currency
        },
        source_type: 'CARD',
        card_details: {
          status: 'CAPTURED',
          card: {
            card_brand: 'VISA',
            last_4: '1234'
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        payment: mockPayment,
        receiptUrl: `https://squareup.com/receipt/${mockPayment.id}`
      };
      
    } catch (error: unknown) {
      console.error('Square payment error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Create a customer in Square
   * Mock implementation for development
   */
  async createCustomer(params: {
    givenName?: string;
    familyName?: string;
    emailAddress?: string;
    phoneNumber?: string;
    companyName?: string;
  }): Promise<CustomerResult> {
    try {
      console.log('Creating Square customer:', params);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock customer creation
      const mockCustomer = {
        id: `customer_${Math.random().toString(36).substr(2, 9)}`,
        given_name: params.givenName,
        family_name: params.familyName,
        email_address: params.emailAddress,
        phone_number: params.phoneNumber,
        company_name: params.companyName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        customer: mockCustomer
      };
      
    } catch (error: unknown) {
      console.error('Square customer creation error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed'
      };
    }
  }

  /**
   * Get subscription pricing
   */
  getSubscriptionPricing() {
    return {
      pro: {
        monthly: { amount: 999, currency: 'USD' }, // $9.99
        annual: { amount: 7999, currency: 'USD' }   // $79.99 (33% savings)
      },
      business: {
        monthly: { amount: 2499, currency: 'USD' }, // $24.99
        annual: { amount: 19999, currency: 'USD' }  // $199.99 (33% savings)
      }
    };
  }

  /**
   * Calculate amount based on plan
   */
  calculatePlanAmount(plan: string): { amount: number; currency: string } {
    const pricing = this.getSubscriptionPricing();
    
    switch (plan) {
      case 'pro':
        return pricing.pro.monthly;
      case 'pro_annual':
        return pricing.pro.annual;
      case 'business':
        return pricing.business.monthly;
      case 'business_annual':
        return pricing.business.annual;
      default:
        throw new Error(`Invalid subscription plan: ${plan}`);
    }
  }

  /**
   * Verify webhook signature (for production)
   */
  verifyWebhookSignature(body: string, signature: string, signatureKey: string): boolean {
    // Implementation for webhook signature verification
    // This is important for production security
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha1', signatureKey)
        .update(body)
        .digest('base64');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

export const squareService = new SquareService();