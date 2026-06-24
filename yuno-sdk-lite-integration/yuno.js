import dotenv from "dotenv";

dotenv.config();

// Variaveis de Ambiente / Environment Variables
const API_URL = process.env.API_URL;
export const ACCOUNT_CODE = process.env.ACCOUNT_CODE;
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY;
const PRIVATE_SECRET_KEY = process.env.PRIVATE_SECRET_KEY;
// export const CUSTOMER_ID = "0f255b41-c076-455e-8c96-8702fe7d51f6";
export const CUSTOMER_ID = "7ab03456-833c-4c8d-8a83-833b777363c6";

async function createCustomer(customer) {
  const response = fetch(`${API_URL}/v1/customers`, {
    method: "POST",
    headers: {
      "public-api-key": PUBLIC_API_KEY,
      "private-secret-key": PRIVATE_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  }).then((resp) => resp.json());

  return response;
}

export async function createCheckoutSession(order) {
  const response = await fetch(`${API_URL}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      "public-api-key": PUBLIC_API_KEY,
      "private-secret-key": PRIVATE_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  return response.json();
}

export async function createPayment(idempotencyKey, payment) {
  const response = await fetch(`${API_URL}/v1/payments`, {
    method: "POST",
    headers: {
      "public-api-key": PUBLIC_API_KEY,
      "private-secret-key": PRIVATE_SECRET_KEY,
      "X-idempotency-key": idempotencyKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  return response.json();
}

export async function getPaymentMethods(checkoutSession) {
  const response = await fetch(
    `${API_URL}/v1/checkout/sessions/${checkoutSession}/payment-methods`,
    {
      method: "GET",
      headers: {
        "public-api-key": PUBLIC_API_KEY,
        "private-secret-key": PRIVATE_SECRET_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  const paymentMethods = await response.json();
  return paymentMethods;
}

// NuPay Payment Conditions - Mock implementation
// Condições de Pagamento NuPay - Implementação mock
// In production, this would integrate with SpinPay API
// Em produção, isso integraria com a API SpinPay
export async function getNuPayPaymentConditions(amount, document) {
  // Mock response simulating NuPay Payment Conditions API
  // Resposta mock simulando a API de Condições de Pagamento NuPay
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
