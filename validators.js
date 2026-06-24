/**
 * Validators - Módulo de validação e normalização de inputs
 * Validators - Input validation and normalization module
 *
 * Garante que dados do usuário estejam no formato correto antes de processar
 * Ensures user data is in the correct format before processing
 */

// ========================================
// CPF
// ========================================

/**
 * Normaliza CPF removendo pontos, traços e espaços
 * Normalizes CPF by removing dots, dashes and spaces
 * "123.456.789-01" → "12345678901"
 */
export function normalizeCPF(cpf) {
  if (!cpf) return '';
  return String(cpf).replace(/\D/g, '').slice(0, 11);
}

/**
 * Valida CPF (11 dígitos + dígitos verificadores)
 * Validates CPF (11 digits + check digits)
 */
export function validateCPF(cpf) {
  const normalized = normalizeCPF(cpf);

  // Deve ter 11 dígitos / Must have 11 digits
  if (normalized.length !== 11) {
    return { valid: false, error: 'CPF deve ter 11 dígitos', normalized };
  }

  // Não pode ser todos dígitos iguais / Cannot be all same digits
  if (/^(\d)\1{10}$/.test(normalized)) {
    return { valid: false, error: 'CPF inválido (dígitos repetidos)', normalized };
  }

  // Validação dos dígitos verificadores / Check digit validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(normalized[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;

  if (digit1 !== parseInt(normalized[9])) {
    return { valid: false, error: 'CPF inválido (dígito verificador)', normalized };
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(normalized[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;

  if (digit2 !== parseInt(normalized[10])) {
    return { valid: false, error: 'CPF inválido (dígito verificador)', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// CNPJ
// ========================================

/**
 * Normaliza CNPJ removendo pontos, traços, barras e espaços
 * Normalizes CNPJ by removing dots, dashes, slashes and spaces
 * "12.345.678/0001-90" → "12345678000190"
 */
export function normalizeCNPJ(cnpj) {
  if (!cnpj) return '';
  return String(cnpj).replace(/\D/g, '').slice(0, 14);
}

/**
 * Valida CNPJ (14 dígitos + dígitos verificadores)
 * Validates CNPJ (14 digits + check digits)
 */
export function validateCNPJ(cnpj) {
  const normalized = normalizeCNPJ(cnpj);

  if (normalized.length !== 14) {
    return { valid: false, error: 'CNPJ deve ter 14 dígitos', normalized };
  }

  if (/^(\d)\1{13}$/.test(normalized)) {
    return { valid: false, error: 'CNPJ inválido (dígitos repetidos)', normalized };
  }

  // Validação dos dígitos verificadores / Check digit validation
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(normalized[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;

  if (digit1 !== parseInt(normalized[12])) {
    return { valid: false, error: 'CNPJ inválido (dígito verificador)', normalized };
  }

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(normalized[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;

  if (digit2 !== parseInt(normalized[13])) {
    return { valid: false, error: 'CNPJ inválido (dígito verificador)', normalized };
  }

  return { valid: true, normalized };
}

/**
 * Valida documento (CPF ou CNPJ baseado no tamanho)
 * Validates document (CPF or CNPJ based on length)
 */
export function validateDocument(document) {
  const normalized = String(document || '').replace(/\D/g, '');

  if (normalized.length === 11) {
    return { ...validateCPF(normalized), type: 'CPF' };
  } else if (normalized.length === 14) {
    return { ...validateCNPJ(normalized), type: 'CNPJ' };
  } else {
    return { valid: false, error: 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos', normalized };
  }
}

// ========================================
// EMAIL
// ========================================

/**
 * Normaliza email (lowercase, trim)
 * Normalizes email (lowercase, trim)
 */
export function normalizeEmail(email) {
  if (!email) return '';
  return String(email).toLowerCase().trim();
}

/**
 * Valida formato de email
 * Validates email format
 */
export function validateEmail(email) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    return { valid: false, error: 'Email é obrigatório', normalized };
  }

  // Regex para validação de email / Regex for email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(normalized)) {
    return { valid: false, error: 'Formato de email inválido', normalized };
  }

  // Verificar se tem domínio válido / Check if has valid domain
  const parts = normalized.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return { valid: false, error: 'Email deve ter um domínio válido', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// CEP (Brazilian Postal Code)
// ========================================

/**
 * Normaliza CEP removendo traços e espaços
 * Normalizes CEP by removing dashes and spaces
 * "12345-678" → "12345678"
 */
export function normalizeCEP(cep) {
  if (!cep) return '';
  return String(cep).replace(/\D/g, '').slice(0, 8);
}

/**
 * Valida CEP brasileiro (8 dígitos)
 * Validates Brazilian CEP (8 digits)
 */
export function validateCEP(cep) {
  const normalized = normalizeCEP(cep);

  if (normalized.length !== 8) {
    return { valid: false, error: 'CEP deve ter 8 dígitos', normalized };
  }

  // Não pode ser todos zeros / Cannot be all zeros
  if (normalized === '00000000') {
    return { valid: false, error: 'CEP inválido', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// ESTADO (UF) / STATE (Brazilian Federation Unit)
// ========================================

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Normaliza estado (uppercase, trim)
 * Normalizes state code (uppercase, trim)
 */
export function normalizeEstado(estado) {
  if (!estado) return '';
  return String(estado).toUpperCase().trim().slice(0, 2);
}

/**
 * Valida UF brasileira
 * Validates Brazilian state code
 */
export function validateEstado(estado) {
  const normalized = normalizeEstado(estado);

  if (!normalized) {
    return { valid: false, error: 'Estado é obrigatório', normalized };
  }

  if (!ESTADOS_BR.includes(normalized)) {
    return { valid: false, error: 'Estado inválido (use sigla: SP, RJ, MG...)', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// AMOUNT (VALOR) / AMOUNT (VALUE)
// ========================================

/**
 * Normaliza amount para centavos (inteiro)
 * Normalizes amount to cents (integer)
 * "20.00" → 2000
 * "20,50" → 2050
 * 2000 → 2000
 */
export function normalizeAmount(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return null;
  }

  // Se já é número inteiro (provavelmente em centavos)
  // If already an integer (probably in cents)
  if (typeof amount === 'number' && Number.isInteger(amount)) {
    return amount;
  }

  // Se é string, converter / If string, convert
  let str = String(amount).trim();

  // Remove espaços e símbolos de moeda / Remove spaces and currency symbols
  str = str.replace(/[R$\s]/g, '');

  // Troca vírgula por ponto / Replace comma with dot
  str = str.replace(',', '.');

  const num = parseFloat(str);

  if (isNaN(num)) {
    return null;
  }

  // Se o número parece estar em reais (tem decimais ou é pequeno), converte pra centavos
  // If number seems to be in reais (has decimals or is small), convert to cents
  if (str.includes('.') || num < 100) {
    return Math.round(num * 100);
  }

  // Já está em centavos / Already in cents
  return Math.round(num);
}

/**
 * Valida amount (deve ser positivo)
 * Validates amount (must be positive)
 */
export function validateAmount(amount) {
  const normalized = normalizeAmount(amount);

  if (normalized === null) {
    return { valid: false, error: 'Valor inválido', normalized: null };
  }

  if (normalized <= 0) {
    return { valid: false, error: 'Valor deve ser maior que zero', normalized };
  }

  if (normalized > 99999999) { // Max ~R$ 999.999,99
    return { valid: false, error: 'Valor muito alto', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// CURRENCY (MOEDA) / CURRENCY
// ========================================

// Moedas válidas / Valid currencies
const CURRENCIES_VALID = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'];

/**
 * Normaliza currency (uppercase, trim)
 * Normalizes currency code (uppercase, trim)
 */
export function normalizeCurrency(currency) {
  if (!currency) return 'BRL'; // Default / Padrão
  return String(currency).toUpperCase().trim().slice(0, 3);
}

/**
 * Valida código de moeda
 * Validates currency code
 */
export function validateCurrency(currency) {
  const normalized = normalizeCurrency(currency);

  if (!CURRENCIES_VALID.includes(normalized)) {
    return { valid: false, error: `Moeda inválida. Válidas: ${CURRENCIES_VALID.join(', ')}`, normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// PAÍS / COUNTRY
// ========================================

// Países válidos / Valid countries
const COUNTRIES_VALID = ['BR', 'US', 'AR', 'CL', 'CO', 'MX', 'PE', 'UY'];

/**
 * Normaliza código de país (uppercase)
 * Normalizes country code (uppercase)
 */
export function normalizeCountry(country) {
  if (!country) return 'BR'; // Default / Padrão
  return String(country).toUpperCase().trim().slice(0, 2);
}

/**
 * Valida código de país
 * Validates country code
 */
export function validateCountry(country) {
  const normalized = normalizeCountry(country);

  if (!COUNTRIES_VALID.includes(normalized)) {
    return { valid: false, error: `País inválido. Válidos: ${COUNTRIES_VALID.join(', ')}`, normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// TELEFONE / PHONE
// ========================================

/**
 * Normaliza telefone removendo tudo exceto números
 * Normalizes phone by removing everything except digits
 * "(11) 99999-9999" → "11999999999"
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '').slice(0, 13);
}

/**
 * Valida telefone brasileiro (10-11 dígitos com DDD)
 * Validates Brazilian phone number (10-11 digits with area code)
 */
export function validatePhone(phone) {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return { valid: true, normalized }; // Telefone é opcional / Phone is optional
  }

  if (normalized.length < 10 || normalized.length > 13) {
    return { valid: false, error: 'Telefone deve ter 10-11 dígitos (com DDD)', normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// STRING GENÉRICA / GENERIC STRING (Name, Address, City)
// ========================================

/**
 * Normaliza string genérica (trim, remove espaços extras)
 * Normalizes generic string (trim, remove extra spaces)
 */
export function normalizeString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

/**
 * Valida string obrigatória
 * Validates required string
 */
export function validateRequiredString(str, fieldName = 'Campo') {
  const normalized = normalizeString(str);

  if (!normalized) {
    return { valid: false, error: `${fieldName} é obrigatório`, normalized };
  }

  if (normalized.length < 2) {
    return { valid: false, error: `${fieldName} muito curto`, normalized };
  }

  return { valid: true, normalized };
}

// ========================================
// VALIDADOR DE OBJETO COMPLETO / FULL OBJECT VALIDATOR
// ========================================

/**
 * Valida e normaliza um objeto de pagamento completo
 * Validates and normalizes a complete payment object
 * Retorna objeto com dados normalizados ou erros
 * Returns object with normalized data or errors
 */
export function validatePaymentData(data) {
  const errors = [];
  const normalized = {};

  // Document (CPF/CNPJ) / Documento (CPF/CNPJ)
  if (data.documentNumber || data.document) {
    const docResult = validateDocument(data.documentNumber || data.document);
    if (!docResult.valid) {
      errors.push(docResult.error);
    } else {
      normalized.documentNumber = docResult.normalized;
      normalized.documentType = docResult.type;
    }
  }

  // Email
  if (data.email) {
    const emailResult = validateEmail(data.email);
    if (!emailResult.valid) {
      errors.push(emailResult.error);
    } else {
      normalized.email = emailResult.normalized;
    }
  }

  // CEP
  if (data.zipCode || data.cep) {
    const cepResult = validateCEP(data.zipCode || data.cep);
    if (!cepResult.valid) {
      errors.push(cepResult.error);
    } else {
      normalized.zipCode = cepResult.normalized;
    }
  }

  // Estado
  if (data.state || data.estado) {
    const stateResult = validateEstado(data.state || data.estado);
    if (!stateResult.valid) {
      errors.push(stateResult.error);
    } else {
      normalized.state = stateResult.normalized;
    }
  }

  // Amount
  if (data.amount !== undefined) {
    const amountResult = validateAmount(data.amount);
    if (!amountResult.valid) {
      errors.push(amountResult.error);
    } else {
      normalized.amount = amountResult.normalized;
    }
  }

  // Currency
  if (data.currency) {
    const currencyResult = validateCurrency(data.currency);
    if (!currencyResult.valid) {
      errors.push(currencyResult.error);
    } else {
      normalized.currency = currencyResult.normalized;
    }
  }

  // Country
  if (data.country) {
    const countryResult = validateCountry(data.country);
    if (!countryResult.valid) {
      errors.push(countryResult.error);
    } else {
      normalized.country = countryResult.normalized;
    }
  }

  // Phone
  if (data.phone) {
    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.valid) {
      errors.push(phoneResult.error);
    } else {
      normalized.phone = phoneResult.normalized;
    }
  }

  // Strings (city, address) / Strings (cidade, endereço)
  if (data.city) {
    normalized.city = normalizeString(data.city);
  }
  if (data.address || data.addressLine1) {
    normalized.addressLine1 = normalizeString(data.address || data.addressLine1);
  }
  if (data.addressLine2) {
    normalized.addressLine2 = normalizeString(data.addressLine2);
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: { ...data, ...normalized }
  };
}

// Export default / Exportação padrão
export default {
  // CPF
  normalizeCPF,
  validateCPF,
  // CNPJ
  normalizeCNPJ,
  validateCNPJ,
  // Document (CPF or CNPJ) / Documento (CPF ou CNPJ)
  validateDocument,
  // Email
  normalizeEmail,
  validateEmail,
  // CEP
  normalizeCEP,
  validateCEP,
  // Estado / State
  normalizeEstado,
  validateEstado,
  // Amount / Valor
  normalizeAmount,
  validateAmount,
  // Currency / Moeda
  normalizeCurrency,
  validateCurrency,
  // Country / País
  normalizeCountry,
  validateCountry,
  // Phone / Telefone
  normalizePhone,
  validatePhone,
  // String / String
  normalizeString,
  validateRequiredString,
  // Full validation / Validação completa
  validatePaymentData
};
