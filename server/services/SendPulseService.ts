// SendPulse Email Service for DealRadar
// Handles OAuth authentication and email sending via SendPulse API

interface SendPulseToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface SendEmailRequest {
  to: EmailRecipient[];
  from: {
    email: string;
    name: string;
  };
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  variables?: Record<string, string>;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

class SendPulseService {
  private clientId: string;
  private clientSecret: string;
  private apiBaseUrl: string = 'https://api.sendpulse.com';
  private token: SendPulseToken | null = null;

  constructor() {
    const clientId = process.env.SENDPULSE_ID;
    const clientSecret = process.env.SENDPULSE_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('SendPulse credentials not found in environment variables');
    }
    
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Get access token using OAuth 2.0 client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      // Store token with expiry time
      this.token = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        expires_at: Date.now() + (tokenData.expires_in * 1000) - 60000, // Subtract 1 minute for safety
      };

      console.log('SendPulse access token obtained successfully');
      return this.token.access_token;
    } catch (error) {
      console.error('SendPulse authentication error:', error);
      throw new Error(`Failed to authenticate with SendPulse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated API request to SendPulse
   */
  private async makeApiRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      ...(data && method !== 'GET' ? { body: JSON.stringify(data) } : {}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendPulse API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Send email using SendPulse SMTP API
   */
  async sendEmail(emailRequest: SendEmailRequest): Promise<SendEmailResult> {
    try {
      const emailData = {
        email: {
          from: emailRequest.from,
          to: emailRequest.to,
          subject: emailRequest.subject,
          html: emailRequest.htmlContent,
          text: emailRequest.textContent || this.stripHtml(emailRequest.htmlContent),
          ...(emailRequest.templateId && { template: { id: emailRequest.templateId } }),
          ...(emailRequest.variables && { variables: emailRequest.variables }),
        },
      };

      console.log('Sending email via SendPulse:', {
        to: emailRequest.to.map(r => r.email),
        subject: emailRequest.subject,
        from: emailRequest.from.email,
      });

      const result = await this.makeApiRequest('/smtp/emails', 'POST', emailData);

      return {
        success: true,
        messageId: result.id || result.message_id,
        details: result,
      };
    } catch (error) {
      console.error('SendPulse email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send deal alert email
   */
  async sendDealAlert(userEmail: string, userName: string, deals: any[], storeName: string): Promise<SendEmailResult> {
    const dealCount = deals.length;
    const totalSavings = deals.reduce((sum, deal) => sum + (deal.savings || 0), 0);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎯 New Deals Found!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">DealRadar has found ${dealCount} new deals at ${storeName}</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! We've found ${dealCount} new deals that match your criteria at ${storeName}. 
            You could save up to <strong>$${totalSavings.toFixed(2)}</strong>!
          </p>
          
          <div style="margin: 30px 0;">
            ${deals.slice(0, 5).map(deal => `
              <div style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${deal.title}</h3>
                <p style="margin: 5px 0; color: #666;">
                  <span style="text-decoration: line-through;">$${deal.originalPrice}</span>
                  <strong style="color: #e74c3c; font-size: 18px; margin-left: 10px;">$${deal.salePrice}</strong>
                  <span style="background: #2ecc71; color: white; padding: 4px 8px; border-radius: 4px; margin-left: 10px; font-size: 12px;">
                    ${deal.discountPercent}% OFF
                  </span>
                </p>
              </div>
            `).join('')}
          </div>
          
          ${dealCount > 5 ? `<p style="color: #666; text-align: center;">...and ${dealCount - 5} more deals!</p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/results" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View All Deals
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
          <p>You received this because you have deal alerts enabled in your DealRadar account.</p>
          <p>
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/settings" style="color: #667eea;">Manage Preferences</a> | 
            <a href="mailto:support@dealradar.com" style="color: #667eea;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      from: { email: 'deals@dealradar.com', name: 'DealRadar' },
      subject: `🎯 ${dealCount} New Deals Found at ${storeName}`,
      htmlContent,
    });
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(userEmail: string, userName: string, planName: string, planPrice: string): Promise<SendEmailResult> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ${planName}!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your subscription is now active</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for upgrading to <strong>${planName}</strong>! Your subscription has been activated 
            and you now have access to all premium features.
          </p>
          
          <div style="background: white; padding: 25px; margin: 25px 0; border-radius: 8px; border: 2px solid #2ecc71;">
            <h3 style="color: #2ecc71; margin: 0 0 15px 0;">Your Plan Details</h3>
            <p style="margin: 5px 0; color: #333;"><strong>Plan:</strong> ${planName}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Price:</strong> ${planPrice}</p>
            <p style="margin: 5px 0; color: #333;"><strong>Status:</strong> Active</p>
          </div>
          
          <h3 style="color: #333; margin: 25px 0 15px 0;">What's included:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Advanced deal filtering and sorting</li>
            <li>Email alerts for new deals</li>
            <li>Extended scan history</li>
            <li>Priority customer support</li>
            <li>Export data to CSV</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/profile" 
               style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Manage Subscription
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
          <p>Need help? Our support team is here to assist you.</p>
          <p>
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/help" style="color: #2ecc71;">Help Center</a> | 
            <a href="mailto:support@dealradar.com" style="color: #2ecc71;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      from: { email: 'welcome@dealradar.com', name: 'DealRadar Team' },
      subject: `Welcome to ${planName} - Your subscription is active!`,
      htmlContent,
    });
  }

  /**
   * Send welcome email for new users
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<SendEmailResult> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Welcome to DealRadar!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your deal-hunting journey starts now</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to DealRadar! We're excited to help you discover amazing deals at your favorite stores. 
            Our advanced scanning technology finds discounted items so you don't have to.
          </p>
          
          <h3 style="color: #333; margin: 25px 0 15px 0;">Getting Started:</h3>
          <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 10px 0; color: #666;">
              <strong>1.</strong> Set up your ZIP code for local store scanning
            </p>
            <p style="margin: 10px 0; color: #666;">
              <strong>2.</strong> Choose your favorite stores to monitor
            </p>
            <p style="margin: 10px 0; color: #666;">
              <strong>3.</strong> Run your first deal scan and discover savings!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start Deal Hunting
            </a>
          </div>
        </div>
        
        <div style="background-color: #333; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
          <p>Happy deal hunting!</p>
          <p>
            <a href="https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/help" style="color: #667eea;">Help Center</a> | 
            <a href="mailto:support@dealradar.com" style="color: #667eea;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: [{ email: userEmail, name: userName }],
      from: { email: 'welcome@dealradar.com', name: 'DealRadar Team' },
      subject: '🎯 Welcome to DealRadar - Start finding deals today!',
      htmlContent,
    });
  }

  /**
   * Test email connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getAccessToken();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Strip HTML tags from content for text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export singleton instance
export const sendPulseService = new SendPulseService();