import express from "express";
import { fileURLToPath } from "url";
import {
  ACCOUNT_CODE,
  createCheckoutSession,
  getPaymentMethods,
  createPayment,
  getNuPayPaymentConditions,
  CUSTOMER_ID,
} from "./yuno.js";
import path, { dirname } from "path";
import * as uuid from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const indexPage = path.join(__dirname, "index.html");
const sdkLitePage = path.join(__dirname, "sdk-lite.html");
const staticDirectory = path.join(__dirname, "static");

const app = express();

app.use(express.json());
app.use("/static", express.static(staticDirectory));

app.get("/", (req, res) => {
  res.sendFile(indexPage);
});

app.get("/sdk-lite.html", (req, res) => {
  res.sendFile(sdkLitePage);
});

// Endpoint que cria a session de checkout / Endpoint that creates the checkout session
app.post("/checkout/sessions", async (req, res) => {
  const order = {
    account_id: ACCOUNT_CODE,
    merchant_order_id: "1655401222",
    payment_description: "Test MP 1654536326",
    country: "BR",
    customer_id: CUSTOMER_ID,
    amount: {
      value: 2000,
      currency: "BRL",
    },
  };

  const response = await createCheckoutSession(order);
  res.json(response);
});

// Cria pagamento na Yuno (SDK Lite — token + tipo; Smart PIX, PayPal, NuPay, cartão)
// Creates payment in Yuno (SDK Lite — token + type; Smart PIX, PayPal, NuPay, card)
app.post("/payments", async (req, res) => {
  const country = "BR";
  const currency = "BRL";
  const amount = 2000;
  const oneTimeToken = req.body.oneTimeToken;
  const checkoutSession = req.body.checkoutSession;

  const rawType = req.body.paymentMethodType ?? "CARD";
  const PAYMENT_TYPE_MAP = { 0: "GOOGLE_PAY", 1: "APPLE_PAY", 2: "PAYPAL", "0": "GOOGLE_PAY", "1": "APPLE_PAY", "2": "PAYPAL" };
  const paymentMethodType = PAYMENT_TYPE_MAP[rawType] ?? (typeof rawType === "string" ? rawType : String(rawType));
  const nuPayData = req.body.nuPayData;
  const clickToPayData = req.body.clickToPayData;

  const documentNumber = (req.body.documentNumber || "35104075397").replace(/\D/g, "").slice(0, 11);

  const payment = {
    description: "Pigeonz Street Wear - Payment",
    account_id: ACCOUNT_CODE,
    merchant_order_id: "1655401222",
    country,
    amount: { currency, value: amount },
    checkout: { session: checkoutSession },
    customer_payer: {
      billing_address: {
        address_line_1: "123 Example St",
        address_line_2: "Apt 502",
        city: "São Paulo",
        country,
        state: "SP",
        zip_code: "01310100",
      },
      shipping_address: {
        address_line_1: "123 Example St",
        address_line_2: "Apt 502",
        city: "São Paulo",
        country,
        state: "SP",
        zip_code: "01310100",
      },
      document: { document_type: "CPF", document_number: documentNumber },
      id: CUSTOMER_ID,
      nationality: "BR",
    },
    payment_method: {
      type: paymentMethodType,
      token: oneTimeToken,
      vaulted_token: null,
    },
  };

  if (nuPayData && paymentMethodType === "NU_PAY") {
    payment.payment_method.detail = {
      nupay: {
        funding_source: nuPayData.fundingSource,
        installments: nuPayData.installments,
        authorization_type: nuPayData.authorizationType,
      },
    };
  }

  if (req.body.installments && paymentMethodType === "CARD") {
    payment.payment_method.detail = {
      card: {
        installments: req.body.installments,
        installments_type: req.body.installmentsType || "MERCHANT",
      },
    };
  }

  if (paymentMethodType === "CARD") {
    payment.metadata = [
      { key: "cpf", value: documentNumber || "13842438605" },
      { key: "type", value: "card" },
    ];
  }

  // Smart PIX (dLocal) — configure o método na conta Yuno. Se a API rejeitar REDIRECT, remova workflow/callback_url.
  // Smart PIX (dLocal) — configure the method in Yuno account. If API rejects REDIRECT, remove workflow/callback_url.
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

  const isPayPal =
    paymentMethodType === "PAYPAL" ||
    paymentMethodType === "PAYPAL_WALLET" ||
    paymentMethodType === "PAY_PAL";
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
    console.error("Yuno createPayment error:", err); // Erro ao criar pagamento na Yuno
    return res.status(502).json({
      error: "Erro ao chamar API Yuno", // Error calling Yuno API
      message: err.message,
      checkout_session_id: checkoutSession,
    });
  }

  if (response?.code || response?.error || response?.messages) {
    const yunoMessage = response?.messages?.[0] || response?.message || response?.error;
    return res.status(400).json({
      error: "Pagamento rejeitado", // Payment rejected
      message: yunoMessage,
      checkout_session_id: checkoutSession,
      yuno: response,
    });
  }

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

// Retorno após REDIRECT (PayPal / Smart PIX) / Return after REDIRECT (PayPal / Smart PIX)
app.get("/payment-success", (req, res) => {
  const provider = req.query.provider || "pagamento";
  res.type("html").send(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pagamento</title></head><body style="font-family:sans-serif;text-align:center;padding:2rem"><h1>Retorno (${provider})</h1><p>Confirme o status via webhook da Yuno.</p><p><a href="/">Voltar</a></p></body></html>`
  );
});

// NuPay Payment Conditions Endpoint
app.post("/nupay/payment-conditions", async (req, res) => {
  const { amount, document } = req.body;

  try {
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

const SERVER_PORT = 8080;
app.listen(SERVER_PORT, () => {
  console.log(`Server is running at: http://localhost:${SERVER_PORT}`);
});
