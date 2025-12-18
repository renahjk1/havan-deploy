// GhostsPay API Configuration
const GHOSTSPAY_CONFIG = {
    // Replace with your actual API key from GhostsPay dashboard
    API_KEY: 'e99d0ff2-8a4c-48b7-97b2-b397b6ec1fb6',
    
    // API Base URL
    BASE_URL: 'https://app.ghostspaysv1.com/api/v1',
    
    // Endpoints
    ENDPOINTS: {
        AUTH_SELLER: '/auth.apiKeySeller',
        CREATE_PURCHASE: '/transaction.purchase',
        GET_PAYMENT: '/transaction.getPayment',
        GET_PAYMENT_DETAILS: '/transaction.getPaymentDetails'
    }
};

// GhostsPay API Functions
class GhostsPayAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = GHOSTSPAY_CONFIG.BASE_URL;
        this.authToken = null;
    }

    // Authenticate with seller API key
    async authenticate() {
        try {
            const response = await fetch(`${this.baseUrl}${GHOSTSPAY_CONFIG.ENDPOINTS.AUTH_SELLER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: this.apiKey
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Authentication failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            this.authToken = data.token; // Token vem no campo "token"
            
            return {
                success: true,
                token: this.authToken
            };
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create PIX payment
    async createPixPayment(paymentData) {
        try {
            // Ensure we're authenticated
            if (!this.authToken) {
                const authResult = await this.authenticate();
                if (!authResult.success) {
                    throw new Error('Authentication failed');
                }
            }

            const response = await fetch(`${this.baseUrl}${GHOSTSPAY_CONFIG.ENDPOINTS.CREATE_PURCHASE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: paymentData.customer?.name || 'Cliente',
                    email: paymentData.customer?.email || 'cliente@email.com',
                    cpf: paymentData.customer?.document || '',
                    phone: paymentData.customer?.phone || '',
                    paymentMethod: 'PIX',
                    amount: this.formatAmount(paymentData.amount),
                    description: paymentData.description || 'Compra Loja Oficial do Flamengo',
                    customId: paymentData.external_id || this.generateExternalId(),
                    // Address fields (optional for PIX)
                    cep: paymentData.customer?.cep || '',
                    complement: paymentData.customer?.complement || '',
                    number: paymentData.customer?.number || '',
                    street: paymentData.customer?.street || '',
                    district: paymentData.customer?.district || ''
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: {
                    id: data.id,
                    customId: data.customId,
                    qr_code: data.pixQrCode,
                    pix_code: data.pixCode,
                    status: data.status,
                    amount: paymentData.amount,
                    expires_at: data.expiresAt
                }
            };
        } catch (error) {
            console.error('Error creating PIX payment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check payment status
    async checkPaymentStatus(transactionId) {
        try {
            if (!this.authToken) {
                const authResult = await this.authenticate();
                if (!authResult.success) {
                    throw new Error('Authentication failed');
                }
            }

            const response = await fetch(`${this.baseUrl}${GHOSTSPAY_CONFIG.ENDPOINTS.GET_PAYMENT}?id=${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: {
                    id: data.id,
                    status: this.normalizeStatus(data.status),
                    approved_at: data.approvedAt,
                    rejected_at: data.rejectedAt,
                    expires_at: data.expiresAt
                }
            };
        } catch (error) {
            console.error('Error checking payment status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Normalize status to standard values
    normalizeStatus(status) {
        const statusMap = {
            'pending': 'pending',
            'approved': 'paid',
            'paid': 'paid',
            'rejected': 'failed',
            'expired': 'expired',
            'cancelled': 'cancelled',
            'refunded': 'refunded'
        };
        
        return statusMap[status?.toLowerCase()] || 'pending';
    }

    // Format amount for API
    formatAmount(amount) {
        // GhostsPay expects amount in cents (multiply by 100)
        return Math.round(parseFloat(amount) * 100);
    }

    // Generate external ID
    generateExternalId() {
        return `FLAMENGO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Payment status constants
const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GhostsPayAPI, GHOSTSPAY_CONFIG, PAYMENT_STATUS };
}

