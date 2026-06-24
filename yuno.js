import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import devLogger from "./devLogger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

// Variaveis de Ambiente / Environment Variables
const API_URL = process.env.API_URL;
export const ACCOUNT_CODE = process.env.ACCOUNT_CODE;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
const PRIVATE_SECRET_KEY = process.env.PRIVATE_SECRET_KEY;
// export const CUSTOMER_ID = "0f255b41-c076-455e-8c96-8702fe7d51f6";
export const CUSTOMER_ID = "7ab03456-833c-4c8d-8a83-833b777363c6";

// ========================================
// CREATE CUSTOMER / CRIAR CLIENTE
// ========================================
async function createCustomer(customer) {
  const url = `${API_URL}/v1/customers`;
  const headers = {
    "public-api-key": PUBLIC_API_KEY,
    "private-secret-key": PRIVATE_SECRET_KEY,
    "Content-Type": "application/json",
  };

  // STEP: Function Call / Chamada de função
  devLogger.logStep('createCustomer()', 'FUNCTION', {
    body: customer
  });

  const startTime = Date.now();

  // STEP: API Request / Requisição de API
  devLogger.logStep('POST /v1/customers', 'API_CALL', {
    method: 'POST',
    url: url,
    headers: headers,
    body: customer
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(customer),
  });

  const responseData = await response.json();
  const duration = Date.now() - startTime;

  // STEP: API Response / Resposta de API
  devLogger.logStep('Response /v1/customers', 'API_RESPONSE', {
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    body: responseData
  });

  return responseData;
}

// ========================================
// CREATE CHECKOUT SESSION / CRIAR SESSÃO DE CHECKOUT
// ========================================
export async function createCheckoutSession(order) {
  const url = `${API_URL}/v1/checkout/sessions`;
  const headers = {
    "public-api-key": PUBLIC_API_KEY,
    "private-secret-key": PRIVATE_SECRET_KEY,
    "Content-Type": "application/json",
  };

  // STEP: Function Call
  devLogger.logStep('createCheckoutSession()', 'FUNCTION', {
    body: order
  });

  const startTime = Date.now();

  // STEP: API Request
  devLogger.logStep('POST /v1/checkout/sessions', 'API_CALL', {
    method: 'POST',
    url: url,
    headers: headers,
    body: order
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(order),
  });

  const responseData = await response.json();
  const duration = Date.now() - startTime;

  // STEP: API Response
  devLogger.logStep('Response /v1/checkout/sessions', 'API_RESPONSE', {
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    body: responseData
  });

  if (!response.ok) {
    const err = new Error(responseData?.messages?.[0] || responseData?.message || response.statusText);
    err.status = response.status;
    err.code = responseData?.code;
    err.body = responseData;
    devLogger.logStep('ERROR: createCheckoutSession', 'ERROR', {
      body: responseData
    });
    throw err;
  }

  return responseData;
}

// ========================================
// CREATE PAYMENT / CRIAR PAGAMENTO
// ========================================
export async function createPayment(idempotencyKey, payment) {
  const url = `${API_URL}/v1/payments`;
  const headers = {
    "public-api-key": PUBLIC_API_KEY,
    "private-secret-key": PRIVATE_SECRET_KEY,
    "X-idempotency-key": idempotencyKey,
    "Content-Type": "application/json",
  };

  // STEP: Function Call
  devLogger.logStep('createPayment()', 'FUNCTION', {
    body: { idempotencyKey, ...payment }
  });

  const startTime = Date.now();

  // STEP: API Request
  devLogger.logStep('POST /v1/payments', 'API_CALL', {
    method: 'POST',
    url: url,
    headers: headers,
    body: payment
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payment),
  });

  const responseData = await response.json();
  const duration = Date.now() - startTime;

  // STEP: API Response
  devLogger.logStep('Response /v1/payments', 'API_RESPONSE', {
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    body: responseData
  });

  return responseData;
}

// ========================================
// GET PAYMENT METHODS / OBTER MÉTODOS DE PAGAMENTO
// ========================================
export async function getPaymentMethods(checkoutSession) {
  const url = `${API_URL}/v1/checkout/sessions/${checkoutSession}/payment-methods`;
  const headers = {
    "public-api-key": PUBLIC_API_KEY,
    "private-secret-key": PRIVATE_SECRET_KEY,
    "Content-Type": "application/json",
  };

  // STEP: Function Call
  devLogger.logStep('getPaymentMethods()', 'FUNCTION', {
    body: { checkoutSession }
  });

  const startTime = Date.now();

  // STEP: API Request
  devLogger.logStep('GET /v1/checkout/sessions/.../payment-methods', 'API_CALL', {
    method: 'GET',
    url: url,
    headers: headers
  });

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const responseData = await response.json();
  const duration = Date.now() - startTime;

  // STEP: API Response
  devLogger.logStep('Response payment-methods', 'API_RESPONSE', {
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    body: Array.isArray(responseData) ? `[${responseData.length} methods]` : responseData
  });

  return responseData;
}

// ========================================
// CREATE PAYMENT LINK / CRIAR LINK DE PAGAMENTO
// ========================================
export async function createPaymentLink(paymentLinkData) {
  const url = `${API_URL}/v1/payment-links`;
  const headers = {
    "public-api-key": PUBLIC_API_KEY,
    "private-secret-key": PRIVATE_SECRET_KEY,
    "Content-Type": "application/json",
  };

  // STEP: Function Call
  devLogger.logStep('createPaymentLink()', 'FUNCTION', {
    body: paymentLinkData
  });

  const startTime = Date.now();

  // STEP: API Request
  devLogger.logStep('POST /v1/payment-links', 'API_CALL', {
    method: 'POST',
    url: url,
    headers: headers,
    body: paymentLinkData
  });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(paymentLinkData),
  });

  const responseData = await response.json();
  const duration = Date.now() - startTime;

  // STEP: API Response
  devLogger.logStep('Response /v1/payment-links', 'API_RESPONSE', {
    status: response.status,
    statusText: response.statusText,
    duration: duration,
    body: responseData
  });

  return responseData;
}

// NuPay Payment Conditions - Implementação mock
// NuPay Payment Conditions - Mock implementation
// Em produção, integraria com a API SpinPay / In production, this would integrate with SpinPay API
export async function getNuPayPaymentConditions(amount, document) {
  // Resposta mock simulando API de Payment Conditions do NuPay
  // Mock response simulating NuPay Payment Conditions API
  return [
    {
      type: "debit",
      installmentPlans: [
        {
          amount: amount,
          number: 1
        }
      ]
    },
    {
      type: "credit",
      installmentPlans: [
        {
          amount: amount,
          number: 1
        },
        {
          amount: amount / 2,
          number: 2
        },
        {
          amount: amount / 3,
          number: 3,
          interest: 0.05,
          interestAmount: amount * 0.05,
          iof: amount * 0.008,
          iofPercentage: 0.008,
          totalAmount: amount * 1.08,
          cet: 0.88
        }
      ]
    },
    {
      type: "credit_with_additional_limit",
      amount: amount,
      additionalLimitMessage: "Não consome o limite do cartão",
      installmentPlans: [
        {
          amount: amount * 1.01,
          interestAmount: amount * 0.02,
          number: 1,
          interest: 0.0499,
          iof: amount * 0.0038,
          iofPercentage: 0.0055,
          cet: 0.939,
          totalAmount: amount * 1.039
        }
      ]
    }
  ];
}
