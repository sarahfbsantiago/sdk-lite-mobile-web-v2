import express from "express";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  ACCOUNT_CODE,
  createCheckoutSession,
  getPaymentMethods,
  createPayment,
  createPaymentLink,
  getNuPayPaymentConditions,
  CUSTOMER_ID,
} from "./yuno.js";
import path, { dirname } from "path";
import * as uuid from "uuid";
import devLogger from "./devLogger.js";
import validators from "./validators.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Server na raiz: __dirname = raiz do projeto
// Server at root: __dirname = project root
const rootDir = __dirname;
const viewsDir = path.resolve(rootDir, "views");
const indexPage = path.resolve(viewsDir, "index.html");
const sdkLitePage = path.resolve(viewsDir, "sdk-lite.html");
const publicDir = path.resolve(rootDir, "public");
const staticDirectory = path.resolve(publicDir, "images");

// Verificação na subida: garante que pastas/arquivos existem
// Startup verification: ensures folders/files exist
const pathsOk = [
  [indexPage, "views/index.html"],
  [publicDir, "public"],
].every(([p, label]) => {
  const ok = fs.existsSync(p);
  console.log(ok ? `[OK] ${label}` : `[FALTA] ${label} → ${p}`);
  return ok;
});
const sdkLiteOk = fs.existsSync(sdkLitePage);
if (sdkLiteOk) console.log("[OK] views/sdk-lite.html"); else console.log("[FALTA] views/sdk-lite.html");
if (!pathsOk) {
  console.error("Alguns caminhos não existem. Verifique views/index.html e public/images.");
}
console.log("indexPage (GET /) =", indexPage);

const app = express();

app.use(express.json());

// ========================================
// MIDDLEWARE DE LOGGING AVANÇADO - DevTools Style
// ADVANCED LOGGING MIDDLEWARE - DevTools Style
// ========================================
app.use((req, res, next) => {
  // Ignora requests de arquivos estáticos e frontend-log para não poluir o log
  // Ignores static file requests and frontend-log to avoid log pollution
  if (req.url.startsWith('/static') || req.url.startsWith('/frontend-log') || req.url.endsWith('.css') || req.url.endsWith('.js') || req.url.endsWith('.png') || req.url.endsWith('.ico')) {
    return next();
  }

  // Inicia o ciclo de log / Starts the log cycle
  const cycleId = devLogger.logCycleStart(req);
  devLogger.setCurrentCycleId(cycleId);

  // STEP: Incoming Request
  devLogger.logStep(`${req.method} ${req.originalUrl || req.url}`, 'REQUEST', {
    method: req.method,
    url: `${req.protocol}://${req.get('host')}${req.originalUrl || req.url}`,
    headers: req.headers,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined
  });

  // Captura o response / Captures the response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // STEP: Outgoing Response
    devLogger.logStep(`Response ${req.originalUrl || req.url}`, 'RESPONSE', {
      status: res.statusCode,
      statusText: res.statusCode >= 200 && res.statusCode < 300 ? 'OK' : 'Error',
      body: data
    });
    devLogger.logCycleEnd(cycleId, res.statusCode);
    devLogger.setCurrentCycleId(null);
    return originalJson(data);
  };

  // Captura sendFile também / Also captures sendFile
  const originalSendFile = res.sendFile.bind(res);
  res.sendFile = (filePath, options, callback) => {
    devLogger.logCycleEnd(cycleId, 200);
    devLogger.setCurrentCycleId(null);
    return originalSendFile(filePath, options, callback);
  };

  next();
});

app.use("/static", express.static(publicDir));

const docDirectory = path.resolve(rootDir, "1.doc.merchants");
app.get("/doc/paypal-integracao-yuno.html", (req, res) => {
  res.sendFile(path.join(docDirectory, "paypal-integracao-yuno.html"));
});
app.get("/doc/paypal-integracao-yuno.en.html", (req, res) => {
  res.sendFile(path.join(docDirectory, "paypal-integracao-yuno.en.html"));
});
app.get("/doc/payment-links-yuno.html", (req, res) => {
  res.sendFile(path.join(docDirectory, "payment-links-yuno.html"));
});
app.get("/doc/payment-links-yuno.en.html", (req, res) => {
  res.sendFile(path.join(docDirectory, "payment-links-yuno.en.html"));
});
app.use("/doc", express.static(docDirectory));

app.get("/", (req, res, next) => {
  if (!fs.existsSync(indexPage)) {
    console.error("GET / → arquivo não existe:", indexPage);
    return next(new Error("index.html não encontrado em 1.html/index.html"));
  }
  res.sendFile(indexPage, (err) => {
    if (err) {
      console.error("GET / sendFile error:", err.message, "path:", indexPage);
      next(err);
    }
  });
});

app.get("/sdk-lite.html", (req, res, next) => {
  res.sendFile(sdkLitePage, (err) => {
    if (err) {
      console.error("GET /sdk-lite.html sendFile error:", err.message, "path:", sdkLitePage);
      next(err);
    }
  });
});

// ========================================
// FRONTEND LOG - Recebe eventos do navegador e mostra no terminal
// FRONTEND LOG - Receives browser events and shows in terminal
// ========================================
app.post("/frontend-log", (req, res) => {
  const event = req.body;
  if (event && event.step) {
    devLogger.logFrontend(event);
  }
  res.status(200).json({ received: true });
});

// Endpoint que cria a session de checkout (padrão: BR / BRL)
// Endpoint that creates checkout session (default: BR / BRL)
app.post("/checkout/sessions", async (req, res) => {
  const body = req.body || {};

  // Validar e normalizar country / Validate and normalize country
  const countryResult = validators.validateCountry(body.country);
  const country = countryResult.normalized;

  // Validar e normalizar currency / Validate and normalize currency
  const currencyResult = validators.validateCurrency(body.currency);
  if (!currencyResult.valid) {
    return res.status(400).json({ error: "Validação falhou", message: currencyResult.error });
  }
  const currency = currencyResult.normalized;

  // Validar e normalizar amount / Validate and normalize amount
  const amountResult = validators.validateAmount(body.amount != null ? body.amount : 2000);
  if (!amountResult.valid) {
    return res.status(400).json({ error: "Validação falhou", message: amountResult.error });
  }
  const amountValue = amountResult.normalized;

  const order = {
    account_id: ACCOUNT_CODE,
    merchant_order_id: `order-${Date.now()}`, // único por request (evita INVALID_CHECKOUT_SESSION) / unique per request (avoids INVALID_CHECKOUT_SESSION)
    payment_description: "Pigeonz Street Wear - Checkout",
    country,
    amount: {
      value: amountValue,
      currency,
    },
  };
  if (CUSTOMER_ID) order.customer_id = CUSTOMER_ID;

  try {
    const response = await createCheckoutSession(order);
    const sessionId = response?.checkout_session ?? response?.data?.checkout_session ?? response?.id;
    if (!sessionId) {
      return res.status(400).json({
        error: "Sessão inválida",
        message: response?.messages?.[0] || response?.message || "Checkout session vazia ou inválida.",
        hint: "Verifique .env: ACCOUNT_CODE, CUSTOMER_ID, API_URL (sandbox), e se a conta Yuno está habilitada para BR/BRL.",
        ...response,
      });
    }
    res.json({
      checkout_session: sessionId,
      country: response.country ?? country,
      currency: response.amount?.currency ?? currency,
      ...response,
    });
  } catch (err) {
    const status = err.status >= 400 ? err.status : 502;
    const body = err.body || {};
    console.error("createCheckoutSession error:", err.message, body);
    res.status(status).json({
      error: "Erro ao criar sessão",
      message: err.message,
      code: err.code || body.code,
      messages: body.messages,
      hint: "Confira .env (ACCOUNT_CODE, CUSTOMER_ID, PUBLIC_API_KEY, PRIVATE_SECRET_KEY, API_URL) e Dashboard Yuno para BR/BRL.",
      ...body,
    });
  }
});

// Novo checkout session: BR / BRL (amount em centavos, ex: 2000 = R$ 20,00)
app.post("/checkout/sessions/br", async (req, res) => {
  const order = {
    account_id: ACCOUNT_CODE,
    merchant_order_id: "1655401222",
    payment_description: "Test BR checkout",
    country: "BR",
    customer_id: CUSTOMER_ID,
    amount: {
      value: 2000,
      currency: "BRL",
    },
  };

  try {
    const response = await createCheckoutSession(order);
    if (response?.checkout_session) {
      res.json(response);
    } else {
      res.status(400).json({ error: "Sessão BR rejeitada", message: response?.messages?.[0] || response?.message, ...response });
    }
  } catch (err) {
    console.error("createCheckoutSession US error:", err);
    res.status(502).json({ error: "Erro ao criar sessão BR", message: err.message });
  }
});

// Endpoint que cria o pagamento com a yuno (BR / BRL).
// Endpoint that creates payment with Yuno (BR / BRL).
app.post("/payments", async (req, res) => {
  const country = "BR";
  const currency = "BRL";
  const amount = 2000; // centavos (R$ 20,00) / cents (R$ 20.00)
  const oneTimeToken = req.body.oneTimeToken;
  const checkoutSession = req.body.checkoutSession;
  // Normalizar: SDK pode enviar tipo como número (ex.: 2 = PayPal); request não pode ir "só número".
  // Normalize: SDK may send type as number (e.g.: 2 = PayPal); request can't go with "just number".
  const rawType = req.body.paymentMethodType ?? "CARD";
  const PAYMENT_TYPE_MAP = { 0: "GOOGLE_PAY", 1: "APPLE_PAY", 2: "PAYPAL", "0": "GOOGLE_PAY", "1": "APPLE_PAY", "2": "PAYPAL" };
  const paymentMethodType = PAYMENT_TYPE_MAP[rawType] ?? (typeof rawType === "string" ? rawType : String(rawType));
  const nuPayData = req.body.nuPayData; // NuPay specific data / Dados específicos do NuPay
  const clickToPayData = req.body.clickToPayData; // Click to Pay (APM): débito / crédito na rede / debit / credit on network

  // Validar e normalizar documento (CPF/CNPJ) / Validate and normalize document (CPF/CNPJ)
  const docInput = req.body.documentNumber || "35104075397";
  const docResult = validators.validateDocument(docInput);
  if (!docResult.valid) {
    return res.status(400).json({ error: "Validação falhou", message: docResult.error });
  }
  const documentNumber = docResult.normalized;
  const documentType = docResult.type; // "CPF" ou "CNPJ" / "CPF" or "CNPJ"

  const payment = {
    description: "Pigeonz Street Wear - Payment",
    account_id: ACCOUNT_CODE,
    merchant_order_id: "1655401222",
    country,
    amount: {
      currency,
      value: amount,
    },
    checkout: {
      session: checkoutSession,
    },
    customer_payer: {
      billing_address: {
        address_line_1: "123 Example St",
        address_line_2: "Apt 502",
        city: "New York",
        country,
        state: "NY",
        zip_code: "10001",
      },
      shipping_address: {
        address_line_1: "123 Example St",
        address_line_2: "Apt 502",
        city: "New York",
        country,
        state: "NY",
        zip_code: "10001",
      },
      document: {
        document_type: documentType,
        document_number: documentNumber,
      },
      id: CUSTOMER_ID,
      nationality: "BR",
    },
    payment_method: {
      type: paymentMethodType,
      token: oneTimeToken,
      vaulted_token: null,
    },
  };

  // Add NuPay specific fields if present / Adiciona campos específicos do NuPay se presentes
  if (nuPayData && paymentMethodType === "NU_PAY") {
    payment.payment_method.detail = {
      nupay: {
        funding_source: nuPayData.fundingSource,
        installments: nuPayData.installments,
        authorization_type: nuPayData.authorizationType,
      },
    };
  }

  // Add installments for CARD payments if provided / Adiciona parcelas para pagamentos CARD se fornecido
  if (req.body.installments && paymentMethodType === "CARD") {
    payment.payment_method.detail = {
      card: {
        installments: req.body.installments,
        installments_type: req.body.installmentsType || "MERCHANT",
      },
    };
  }

  // Add metadata for CARD payments (BR) / Adiciona metadados para pagamentos CARD (BR)
  if (paymentMethodType === "CARD") {
    payment.metadata = [
      { key: "cpf", value: documentNumber || "13842438605" },
      { key: "type", value: "card" },
    ];
  }

  // Smart PIX (dLocal) — tipo Yuno SMART_PIX; configure o método na conta Yuno (routing dLocal).
  // Smart PIX (dLocal) — Yuno type SMART_PIX; configure the method in Yuno account (dLocal routing).
  // Se a API rejeitar workflow REDIRECT, remova workflow/callback_url e use apenas o token do SDK (SDK_CHECKOUT).
  // If API rejects REDIRECT workflow, remove workflow/callback_url and use only SDK token (SDK_CHECKOUT).
  const isSmartPix =
    paymentMethodType === "SMART_PIX" ||
    paymentMethodType === "SMARTPIX" ||
    String(paymentMethodType).toUpperCase() === "SMART_PIX";
  if (isSmartPix) {
    payment.payment_method.type = "SMART_PIX";
    payment.payment_method.detail = { smart_pix: {} };
    payment.workflow = "REDIRECT";
    payment.callback_url = process.env.BASE_URL
      ? `${process.env.BASE_URL.replace(/\/$/, "")}/payment-success?provider=smart_pix`
      : `${req.protocol}://${req.get("host")}/payment-success?provider=smart_pix`;
    payment.metadata = [
      { key: "cpf", value: documentNumber },
      { key: "payment_method", value: "smart_pix" },
    ];
  }

  // PayPal Wallet (Yuno Payment type PAYPAL — workflow REDIRECT + callback_url)
  // PayPal Wallet (tipo de pagamento Yuno PAYPAL — workflow REDIRECT + callback_url)
  const isPayPal = paymentMethodType === "PAYPAL" || paymentMethodType === "PAYPAL_WALLET" || paymentMethodType === "PAY_PAL";
  if (isPayPal) {
    payment.payment_method.type = "PAYPAL";
    payment.payment_method.detail = { paypal: {} };
    payment.workflow = "REDIRECT";
    payment.callback_url = process.env.BASE_URL
      ? `${process.env.BASE_URL.replace(/\/$/, "")}/payment-success?provider=paypal`
      : `${req.protocol}://${req.get("host")}/payment-success?provider=paypal`;
    payment.metadata = [
      { key: "payment_method", value: "paypal" },
      { key: "type", value: "wallet" },
    ];
  }

  // Click to Pay (wallet APM) — enviar funding_source (débito/crédito) conforme fluxo Lite + Create Payment
  // Click to Pay (wallet APM) — send funding_source (debit/credit) according to Lite + Create Payment flow
  const isClickToPay =
    paymentMethodType === "CLICK_TO_PAY" ||
    String(paymentMethodType).toUpperCase() === "CLICK_TO_PAY";
  if (isClickToPay) {
    const rawFs = (clickToPayData?.fundingSource ?? "debit").toString().toLowerCase();
    const fundingSource = rawFs === "credit" ? "credit" : "debit";
    payment.payment_method.type = "CLICK_TO_PAY";
    payment.payment_method.detail = {
      click_to_pay: {
        funding_source: fundingSource,
      },
    };
  }

  const idempotencyKey = uuid.v4();
  let response;
  try {
    response = await createPayment(idempotencyKey, payment);
  } catch (err) {
    console.error("Yuno createPayment error:", err);
    return res.status(502).json({
      error: "Erro ao chamar API Yuno",
      message: err.message,
      checkout_session_id: checkoutSession,
    });
  }

  if (response?.code || response?.error || response?.messages) {
    const yunoMessage = response?.messages?.[0] || response?.message || response?.error;
    console.error("Yuno payment rejected:", { checkout_session_id: checkoutSession, response });
    return res.status(400).json({
      error: "Pagamento rejeitado",
      message: yunoMessage,
      checkout_session_id: checkoutSession,
      yuno: response,
    });
  }

  // PayPal / Smart PIX (REDIRECT): expor redirect_url no top level para o front redirecionar
  // PayPal / Smart PIX (REDIRECT): expose redirect_url at top level for frontend to redirect
  if ((isPayPal || isSmartPix) && !response.redirect_url) {
    const pm = response.payment_method ?? response.data?.payment_method;
    const detail = pm?.payment_method_detail ?? pm?.detail;
    const wallet = detail?.wallet ?? detail?.paypal;
    const smartPix = detail?.smart_pix;
    response.redirect_url =
      response.data?.redirect_url ||
      pm?.redirect_url ||
      detail?.redirect_url ||
      wallet?.redirect_url ||
      detail?.paypal?.redirect_url ||
      smartPix?.redirect_url ||
      response.approval_url ||
      pm?.approval_url ||
      response.checkout_url;
  }

  res.json(response);
});

app.get("/payment-methods/:checkoutSession", async (req, res) => {
  const checkoutSession = req.params.checkoutSession;
  const paymentMethods = await getPaymentMethods(checkoutSession);
  res.json(paymentMethods);
});

// PayPal redirect: cria sessão + payment REDIRECT; retorna redirect_url (fallback: Payment Link)
// PayPal redirect: creates session + payment REDIRECT; returns redirect_url (fallback: Payment Link)
app.post("/payments/paypal/redirect", async (req, res) => {
  const sendJson = (status, body) => {
    res.status(status).setHeader("Content-Type", "application/json").end(JSON.stringify(body));
  };
  try {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const callbackUrl = `${baseUrl.replace(/\/$/, "")}/payment-success?provider=paypal`;
    const amount = req.body?.amount ?? 2000;
    const currency = req.body?.currency || "BRL";
    const merchantOrderId = `order-paypal-${Date.now()}`;

    const order = {
      account_id: ACCOUNT_CODE,
      merchant_order_id: merchantOrderId,
      payment_description: "Pagamento PayPal - Pigeonz Street Wear",
      country: "BR",
      customer_id: CUSTOMER_ID,
      amount: { value: amount, currency },
    };
    const sessionResponse = await createCheckoutSession(order);
    const checkoutSession =
      sessionResponse?.checkout_session ?? sessionResponse?.id ?? sessionResponse?.data?.checkout_session;
    if (!checkoutSession) {
      return sendJson(400, { success: false, error: "Falha ao criar checkout session", fullResponse: sessionResponse });
    }

    const payment = {
      description: "Pigeonz Street Wear - PayPal",
      account_id: ACCOUNT_CODE,
      merchant_order_id: merchantOrderId,
      country: "BR",
      amount: { currency, value: amount },
      checkout: { session: checkoutSession },
      payment_method: { type: "PAYPAL", detail: { paypal: {} } },
      callback_url: callbackUrl,
      workflow: "REDIRECT",
      customer_payer: {
        id: CUSTOMER_ID,
        document: { document_type: "CPF", document_number: "35104075397" },
        nationality: "BR",
      },
    };
    const idempotencyKey = uuid.v4();
    const paymentResponse = await createPayment(idempotencyKey, payment);

    if (paymentResponse?.code || paymentResponse?.error) {
      return sendJson(400, {
        success: false,
        error: paymentResponse?.messages || paymentResponse?.message || "Erro ao criar pagamento PayPal",
        fullResponse: paymentResponse,
      });
    }

    const pm = paymentResponse?.payment_method ?? paymentResponse?.data?.payment_method;
    const pmDetail = pm?.payment_method_detail ?? pm?.detail;
    const wallet = pmDetail?.wallet ?? pmDetail?.paypal;
    let redirectUrl =
      paymentResponse?.redirect_url ||
      paymentResponse?.data?.redirect_url ||
      pm?.redirect_url ||
      pmDetail?.redirect_url ||
      wallet?.redirect_url ||
      pmDetail?.paypal?.redirect_url ||
      paymentResponse?.approval_url ||
      pm?.approval_url ||
      paymentResponse?.checkout_url;

    if (!redirectUrl) {
      try {
        const amountValue = typeof amount === "number" && amount >= 100 ? amount / 100 : amount;
        const linkPayload = {
          account_id: ACCOUNT_CODE,
          merchant_order_id: `paypal-${Date.now()}`,
          description: "Pagamento PayPal - Pigeonz Street Wear",
          country: "BR",
          amount: { value: amountValue, currency },
          payment_method_types: ["PAYPAL"],
        };
        let linkResponse = await createPaymentLink(linkPayload);
        if (linkResponse?.code || linkResponse?.error) {
          linkResponse = await createPaymentLink({
            ...linkPayload,
            payment_method_types: ["CARD", "PIX", "SMART_PIX", "BOLETO", "PAYPAL"],
            merchant_order_id: `paypal-${Date.now()}`,
          });
        }
        redirectUrl = linkResponse?.checkout_url || linkResponse?.payment_link || linkResponse?.url || linkResponse?.link;
      } catch (e) {
        console.error("PayPal fallback Payment Link error:", e);
      }
    }
    if (redirectUrl) {
      return sendJson(200, { success: true, redirect_url: redirectUrl });
    }
    return sendJson(500, { success: false, error: "Yuno não retornou redirect_url", fullResponse: paymentResponse });
  } catch (error) {
    console.error("PayPal redirect error:", error);
    return sendJson(500, { success: false, error: "Erro ao iniciar PayPal", details: error?.message || String(error) });
  }
});

// Payment Link Endpoint - Gera link de pagamento automaticamente (retorna checkout_url)
// Payment Link Endpoint - Generates payment link automatically (returns checkout_url)
app.post("/payment-link", async (req, res) => {
  try {
    const productName = validators.normalizeString(req.body.productName) || "Urban Textures T-Shirt";

    // Validar amount / Validate amount
    const amountResult = validators.validateAmount(req.body.amount != null ? req.body.amount : 2000);
    if (!amountResult.valid) {
      return res.status(400).json({ error: "Validação falhou", message: amountResult.error });
    }
    // Payment Link usa valor em reais, não centavos / Payment Link uses value in reais, not cents
    const productAmount = amountResult.normalized / 100;

    // Validar currency / Validate currency
    const currencyResult = validators.validateCurrency(req.body.currency);
    const currency = currencyResult.normalized;
    const payment_method_types = Array.isArray(req.body.payment_method_types) && req.body.payment_method_types.length > 0
      ? req.body.payment_method_types
      : ["CARD", "PIX", "SMART_PIX", "BOLETO"];

    const merchantOrderId = `ORDER-${Date.now()}`;

    const paymentLinkData = {
      account_id: ACCOUNT_CODE,
      merchant_order_id: merchantOrderId,
      description: `Payment ${productName} - Pigeonz Street Wear`,
      country: "BR",
      amount: { value: productAmount, currency },
      payment_method_types,
    };

    console.log("Creating Payment Link:", JSON.stringify(paymentLinkData, null, 2));

    let response = await createPaymentLink(paymentLinkData);

    console.log("Payment Link response:", JSON.stringify(response, null, 2));

    if (response.code || response.error) {
      return res.status(400).json({
        success: false,
        error: response.messages || response.message || "Erro ao criar link",
        fullResponse: response,
      });
    }

    // Retorna o link gerado / Returns the generated link
    res.json({
      success: true,
      paymentLink: response.checkout_url || response.payment_link || response.url || response.link,
      linkId: response.id,
      amount: productAmount,
      currency: currency,
      productName: productName,
      fullResponse: response,
    });
  } catch (error) {
    console.error("Payment Link error:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao gerar link de pagamento",
      details: error.message,
    });
  }
});

// Página de sucesso do pagamento / Payment success page
app.get("/payment-success", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pagamento Realizado</title>
      <style>
        body { font-family: Arial; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }
        .success { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .success h1 { color: #4CAF50; }
        .success a { color: #333; text-decoration: none; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="success">
        <h1>✓ Pagamento Realizado!</h1>
        <p>Obrigado pela sua compra.</p>
        <a href="/">Voltar para a loja</a>
      </div>
    </body>
    </html>
  `);
});

// NuPay Payment Conditions Endpoint
app.post("/nupay/payment-conditions", async (req, res) => {
  const { amount, document } = req.body;

  try {
    // Simulating NuPay Payment Conditions API call
    // In production, this would call SpinPay API
    const paymentConditions = await getNuPayPaymentConditions(amount, document);
    res.json(paymentConditions);
  } catch (error) {
    console.error("NuPay Payment Conditions error:", error);
    res.status(400).json({
      status: 400,
      message: "Payment options not available",
      details: {},
    });
  }
});

// ========================================
// WEBHOOK YUNO - Recebe notificações de pagamento
// WEBHOOK YUNO - Receives payment notifications
// ========================================
// Configure esta URL no painel da Yuno: https://seu-dominio.com/webhook/yuno
// Configure this URL in Yuno dashboard: https://your-domain.com/webhook/yuno
// Para testar localmente, use ngrok: ngrok http 8082
// To test locally, use ngrok: ngrok http 8082
// Depois configure a URL do ngrok no painel Yuno (ex: https://abc123.ngrok.io/webhook/yuno)
// Then configure the ngrok URL in Yuno dashboard (e.g.: https://abc123.ngrok.io/webhook/yuno)

app.post("/webhook/yuno", async (req, res) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');

  console.log('\n' + '🔔'.repeat(30));
  console.log(`[${timestamp}] 🔔 WEBHOOK YUNO RECEBIDO`);
  console.log('🔔'.repeat(30));

  // Headers importantes da Yuno / Important Yuno headers
  const yunoSignature = req.headers['x-webhook-signature'] || req.headers['x-yuno-signature'];
  const yunoEventType = req.headers['x-event-type'] || req.body?.event_type;
  const yunoTimestamp = req.headers['x-webhook-timestamp'];

  console.log('📋 Headers do Webhook:');
  console.log(`   - Signature: ${yunoSignature || 'não enviado'}`);
  console.log(`   - Event Type: ${yunoEventType || 'não informado'}`);
  console.log(`   - Timestamp: ${yunoTimestamp || 'não enviado'}`);

  // Verificação de assinatura (se configurado WEBHOOK_SECRET no .env)
  // Signature verification (if WEBHOOK_SECRET configured in .env)
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret && yunoSignature) {
    // A Yuno pode usar HMAC-SHA256 para assinar o payload
    // Yuno may use HMAC-SHA256 to sign the payload
    // Aqui você pode adicionar verificação de assinatura se necessário
    // Here you can add signature verification if needed
    console.log('🔐 Verificação de assinatura: WEBHOOK_SECRET configurado');
  }

  // Payload do webhook / Webhook payload
  const payload = req.body;
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  // Processar diferentes tipos de eventos / Process different event types
  const eventType = payload.event_type || payload.type || yunoEventType;
  const paymentId = payload.payment_id || payload.id || payload.data?.id;
  const status = payload.status || payload.data?.status;
  const merchantOrderId = payload.merchant_order_id || payload.data?.merchant_order_id;

  console.log('\n📊 Dados do Evento:');
  console.log(`   - Tipo: ${eventType}`);
  console.log(`   - Payment ID: ${paymentId}`);
  console.log(`   - Status: ${status}`);
  console.log(`   - Merchant Order ID: ${merchantOrderId}`);

  // Tratamento por tipo de evento / Handling by event type
  switch (eventType) {
    case 'PAYMENT.CREATED':
    case 'payment.created':
      console.log('💳 Novo pagamento criado / New payment created');
      // Aqui você pode salvar no banco de dados / Here you can save to database
      break;

    case 'PAYMENT.SUCCEEDED':
    case 'PAYMENT.APPROVED':
    case 'payment.succeeded':
    case 'payment.approved':
      console.log('✅ Pagamento APROVADO! / Payment APPROVED!');
      // Liberar produto/serviço, atualizar banco, enviar email, etc.
      // Release product/service, update database, send email, etc.
      break;

    case 'PAYMENT.DECLINED':
    case 'PAYMENT.FAILED':
    case 'payment.declined':
    case 'payment.failed':
      console.log('❌ Pagamento RECUSADO / Payment DECLINED');
      // Notificar cliente, registrar motivo, etc. / Notify customer, log reason, etc.
      break;

    case 'PAYMENT.PENDING':
    case 'payment.pending':
      console.log('⏳ Pagamento PENDENTE / Payment PENDING (awaiting confirmation)');
      break;

    case 'PAYMENT.REFUNDED':
    case 'payment.refunded':
      console.log('💸 Pagamento REEMBOLSADO / Payment REFUNDED');
      break;

    case 'PAYMENT.CANCELLED':
    case 'payment.cancelled':
      console.log('🚫 Pagamento CANCELADO / Payment CANCELLED');
      break;

    default:
      console.log(`📌 Evento não mapeado / Unmapped event: ${eventType}`);
  }

  console.log('🔔'.repeat(30) + '\n');

  // Responder 200 OK para confirmar recebimento (importante!)
  // Respond 200 OK to confirm receipt (important!)
  // A Yuno vai reenviar o webhook se não receber 200
  // Yuno will resend the webhook if it doesn't receive 200
  res.status(200).json({
    success: true,
    message: 'Webhook recebido com sucesso',
    received_at: new Date().toISOString(),
    event_type: eventType,
    payment_id: paymentId,
  });
});

// Endpoint para verificar se o webhook está funcionando (health check)
// Endpoint to check if webhook is working (health check)
app.get("/webhook/yuno", (req, res) => {
  res.json({
    status: 'active',
    message: 'Webhook endpoint está ativo. Use POST para receber eventos.',
    endpoint: '/webhook/yuno',
    supported_events: [
      'PAYMENT.CREATED',
      'PAYMENT.SUCCEEDED',
      'PAYMENT.APPROVED',
      'PAYMENT.DECLINED',
      'PAYMENT.FAILED',
      'PAYMENT.PENDING',
      'PAYMENT.REFUNDED',
      'PAYMENT.CANCELLED'
    ]
  });
});

// Garante que erros não tratados retornem JSON (evita "resposta inválida" no front)
// Ensures unhandled errors return JSON (avoids "invalid response" on frontend)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (!res.headersSent) {
    res.status(500).setHeader("Content-Type", "application/json").end(
      JSON.stringify({
        success: false,
        error: "Erro interno do servidor",
        details: err?.message || String(err),
      })
    );
  }
});

// Roda minha API (Sobe o Web Server) — porta 8082; 0.0.0.0 para aceitar conexões de qualquer interface
// Runs my API (Starts the Web Server) — port 8082; 0.0.0.0 to accept connections from any interface
const SERVER_PORT = Number(process.env.PORT) || 8082;
app.listen(SERVER_PORT, "0.0.0.0", () => {
  devLogger.logServerStart(SERVER_PORT, {
    API_URL: process.env.API_URL,
    ACCOUNT_CODE: process.env.ACCOUNT_CODE,
    PUBLIC_API_KEY: process.env.PUBLIC_API_KEY,
    PRIVATE_SECRET_KEY: process.env.PRIVATE_SECRET_KEY,
    BASE_URL: process.env.BASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development'
  });
});
