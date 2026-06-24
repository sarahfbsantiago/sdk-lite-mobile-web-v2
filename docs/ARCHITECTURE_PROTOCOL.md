# Protocolo de Estruturação de Código e Arquitetura de Software

> Guia agnóstico de linguagem para organização de projetos de software

---

## Sumário

1. [Princípios SOLID](#1-princípios-solid)
2. [Padrões de Design](#2-padrões-de-design)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Convenções de Nomenclatura](#4-convenções-de-nomenclatura)
5. [Documentação de Código](#5-documentação-de-código)
6. [Tratamento de Erros](#6-tratamento-de-erros)
7. [Logging](#7-logging)
8. [Testes](#8-testes)
9. [Versionamento](#9-versionamento)
10. [Controle de Qualidade](#10-controle-de-qualidade)
11. [Decisões Arquiteturais (ADRs)](#11-decisões-arquiteturais-adrs)
12. [Checklist para Novos Projetos](#12-checklist-para-novos-projetos)

---

## 1. Princípios SOLID

### S - Single Responsibility Principle (Responsabilidade Única)

Cada módulo/classe deve ter apenas UMA razão para mudar.

```
# ERRADO: Uma classe que faz tudo
class PaymentProcessor:
    - validate_card()
    - process_payment()
    - send_email()
    - log_transaction()
    - generate_report()

# CORRETO: Responsabilidades separadas
class CardValidator:
    - validate()

class PaymentService:
    - process()

class NotificationService:
    - send_email()

class TransactionLogger:
    - log()
```

**Aplicação prática:**
- Um arquivo = Uma responsabilidade principal
- Funções com no máximo 20-30 linhas
- Se precisar de "and" para descrever o que a função faz, divida-a

### O - Open/Closed Principle (Aberto/Fechado)

Módulos devem estar abertos para extensão, fechados para modificação.

```
# ERRADO: Modificar código existente para cada novo tipo
function processPayment(type) {
    if (type === "card") { ... }
    else if (type === "pix") { ... }
    else if (type === "boleto") { ... }  // Adicionar aqui = modificação
}

# CORRETO: Usar abstrações/interfaces
interface PaymentMethod {
    process()
}

class CardPayment implements PaymentMethod
class PixPayment implements PaymentMethod
class BoletoPayment implements PaymentMethod

// Novo método = nova classe, sem modificar existentes
```

### L - Liskov Substitution Principle (Substituição de Liskov)

Subtipos devem ser substituíveis por seus tipos base.

```
# Se Bird tem fly(), então Penguin não deve herdar de Bird
# Solução: Criar interfaces específicas

interface Walkable { walk() }
interface Flyable { fly() }

class Penguin implements Walkable
class Eagle implements Walkable, Flyable
```

### I - Interface Segregation Principle (Segregação de Interface)

Muitas interfaces específicas são melhores que uma interface geral.

```
# ERRADO: Interface "gordinha"
interface Worker {
    work()
    eat()
    sleep()
    code()
    manage()
}

# CORRETO: Interfaces segregadas
interface Workable { work() }
interface Eatable { eat() }
interface Codeable { code() }
interface Manageable { manage() }
```

### D - Dependency Inversion Principle (Inversão de Dependência)

Dependa de abstrações, não de implementações concretas.

```
# ERRADO: Dependência direta
class OrderService {
    constructor() {
        this.database = new MySQLDatabase()  // Acoplamento forte
    }
}

# CORRETO: Injeção de dependência
class OrderService {
    constructor(database) {  // Aceita qualquer database
        this.database = database
    }
}

// Uso
const db = new MySQLDatabase()
const service = new OrderService(db)
```

---

## 2. Padrões de Design

### 2.1 Padrões Criacionais

#### Factory Pattern
Quando: Criação de objetos complexos ou com múltiplas variações.

```javascript
class PaymentFactory {
    static create(type, data) {
        switch(type) {
            case 'CARD': return new CardPayment(data)
            case 'PIX': return new PixPayment(data)
            case 'BOLETO': return new BoletoPayment(data)
            default: throw new Error(`Unknown payment type: ${type}`)
        }
    }
}
```

#### Singleton Pattern
Quando: Garantir uma única instância (configurações, conexões).

```javascript
class Config {
    static instance = null

    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config()
        }
        return Config.instance
    }
}
```

#### Builder Pattern
Quando: Construir objetos complexos passo a passo.

```javascript
class PaymentBuilder {
    setAmount(value) { this.amount = value; return this }
    setCurrency(curr) { this.currency = curr; return this }
    setMethod(method) { this.method = method; return this }
    build() { return new Payment(this) }
}

// Uso
const payment = new PaymentBuilder()
    .setAmount(1000)
    .setCurrency('BRL')
    .setMethod('PIX')
    .build()
```

### 2.2 Padrões Estruturais

#### Repository Pattern
Quando: Abstrair acesso a dados.

```javascript
// Abstração
class PaymentRepository {
    findById(id) { throw new Error('Not implemented') }
    save(payment) { throw new Error('Not implemented') }
}

// Implementação
class MongoPaymentRepository extends PaymentRepository {
    async findById(id) {
        return await Payment.findById(id)
    }
}
```

#### Adapter Pattern
Quando: Integrar sistemas com interfaces incompatíveis.

```javascript
// API externa retorna formato diferente
class ExternalPaymentAdapter {
    constructor(externalService) {
        this.external = externalService
    }

    process(ourPaymentFormat) {
        const externalFormat = this.convertToExternal(ourPaymentFormat)
        return this.external.pay(externalFormat)
    }
}
```

### 2.3 Padrões Comportamentais

#### Strategy Pattern
Quando: Algoritmos intercambiáveis.

```javascript
// Estratégias de validação
const validationStrategies = {
    BR: (doc) => validateCPF(doc),
    US: (doc) => validateSSN(doc),
    MX: (doc) => validateCURP(doc)
}

function validateDocument(country, document) {
    const strategy = validationStrategies[country]
    if (!strategy) throw new Error(`No validation for ${country}`)
    return strategy(document)
}
```

#### Observer Pattern
Quando: Notificar múltiplos componentes sobre eventos.

```javascript
class PaymentEventEmitter {
    constructor() {
        this.listeners = {}
    }

    on(event, callback) {
        this.listeners[event] = this.listeners[event] || []
        this.listeners[event].push(callback)
    }

    emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data))
    }
}
```

---

## 3. Estrutura de Diretórios

### 3.1 Estrutura Recomendada

```
projeto/
├── src/                          # Código fonte
│   ├── config/                   # Configurações
│   │   ├── index.js              # Exporta configurações
│   │   ├── database.js           # Config do banco
│   │   ├── server.js             # Config do servidor
│   │   └── environment.js        # Variáveis de ambiente
│   │
│   ├── controllers/              # Controladores (entrada HTTP)
│   │   ├── payment.controller.js
│   │   └── checkout.controller.js
│   │
│   ├── services/                 # Lógica de negócio
│   │   ├── payment.service.js
│   │   ├── checkout.service.js
│   │   └── notification.service.js
│   │
│   ├── repositories/             # Acesso a dados
│   │   └── payment.repository.js
│   │
│   ├── models/                   # Modelos/Entidades
│   │   ├── payment.model.js
│   │   └── customer.model.js
│   │
│   ├── routes/                   # Definição de rotas
│   │   ├── index.js              # Agregador de rotas
│   │   ├── payment.routes.js
│   │   └── checkout.routes.js
│   │
│   ├── middlewares/              # Middlewares
│   │   ├── auth.middleware.js
│   │   ├── logger.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/                    # Utilitários
│   │   ├── errors.js             # Classes de erro
│   │   ├── logger.js             # Sistema de log
│   │   ├── validators.js         # Validações
│   │   └── helpers.js            # Funções auxiliares
│   │
│   ├── integrations/             # Integrações externas
│   │   ├── yuno/                 # SDK Yuno
│   │   │   ├── client.js         # Cliente HTTP
│   │   │   ├── payments.js       # Operações de pagamento
│   │   │   └── checkout.js       # Operações de checkout
│   │   └── email/
│   │       └── sendgrid.js
│   │
│   └── app.js                    # Inicialização da aplicação
│
├── public/                       # Arquivos estáticos
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/                        # Templates/Views (se aplicável)
│
├── tests/                        # Testes
│   ├── unit/                     # Testes unitários
│   │   └── services/
│   ├── integration/              # Testes de integração
│   └── e2e/                      # Testes end-to-end
│
├── docs/                         # Documentação
│   ├── ARCHITECTURE_PROTOCOL.md  # Este documento
│   ├── ADR/                      # Decisões arquiteturais
│   │   └── 001-escolha-framework.md
│   └── API.md                    # Documentação da API
│
├── scripts/                      # Scripts de automação
│   ├── setup.sh
│   └── deploy.sh
│
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

### 3.2 Regras de Organização

| Regra | Descrição |
|-------|-----------|
| Camadas | Manter separação clara entre camadas (routes → controllers → services → repositories) |
| Um por arquivo | Uma classe/módulo principal por arquivo |
| Index exports | Usar `index.js` para exportar múltiplos módulos de uma pasta |
| Co-location | Manter arquivos relacionados próximos |
| Profundidade | Máximo 4 níveis de aninhamento |

---

## 4. Convenções de Nomenclatura

### 4.1 Arquivos e Diretórios

```
# Arquivos: kebab-case ou dot notation
payment.controller.js
user-profile.service.js
api-client.js

# Diretórios: kebab-case (lowercase)
src/
user-management/
payment-gateway/

# EVITAR:
PaymentController.js    # PascalCase para arquivo
payment_controller.js   # snake_case
```

### 4.2 Código

```javascript
// Classes: PascalCase
class PaymentService {}
class UserRepository {}

// Funções/Métodos: camelCase
function processPayment() {}
async function createCheckoutSession() {}

// Variáveis: camelCase
const paymentAmount = 1000
let isProcessing = false

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3
const API_BASE_URL = 'https://api.example.com'

// Variáveis de ambiente: UPPER_SNAKE_CASE
process.env.DATABASE_URL
process.env.API_KEY

// Booleanos: prefixos is, has, can, should
const isValid = true
const hasPermission = false
const canProcess = true
const shouldRetry = false

// Arrays: plural
const payments = []
const users = []

// Handlers/Callbacks: sufixo Handler ou prefixo on
function onPaymentSuccess() {}
function errorHandler() {}
```

### 4.3 Nomenclatura Semântica

```javascript
// Verbos para ações
createPayment()    // Criar
getPayment()       // Obter (um)
getAllPayments()   // Obter (todos)
updatePayment()    // Atualizar
deletePayment()    // Deletar
findPaymentById()  // Buscar específico
searchPayments()   // Buscar com filtros
validatePayment()  // Validar
processPayment()   // Processar
calculateTotal()   // Calcular

// Prefixos úteis
parseResponse()    // Converter formato
formatCurrency()   // Formatar para exibição
normalizeData()    // Normalizar estrutura
sanitizeInput()    // Limpar entrada
```

---

## 5. Documentação de Código

### 5.1 Comentários de Código

```javascript
/**
 * Processa um pagamento através da API Yuno.
 *
 * @description Cria uma transação de pagamento, validando os dados
 *              do cliente e do método de pagamento antes de enviar.
 *
 * @param {Object} paymentData - Dados do pagamento
 * @param {number} paymentData.amount - Valor em centavos
 * @param {string} paymentData.currency - Código da moeda (ex: 'BRL')
 * @param {string} paymentData.method - Tipo do método (CARD, PIX, etc)
 * @param {string} paymentData.token - Token do método de pagamento
 *
 * @returns {Promise<PaymentResponse>} Resposta da API com status do pagamento
 *
 * @throws {ValidationError} Se os dados do pagamento forem inválidos
 * @throws {ApiError} Se a API retornar erro
 *
 * @example
 * const result = await processPayment({
 *   amount: 1000,
 *   currency: 'BRL',
 *   method: 'PIX',
 *   token: 'tok_xxx'
 * })
 */
async function processPayment(paymentData) {
    // Implementação...
}
```

### 5.2 Tipos de Comentários

```javascript
// 1. TODO: Tarefa pendente
// TODO: Implementar retry com backoff exponencial

// 2. FIXME: Bug conhecido
// FIXME: Race condition quando múltiplos pagamentos simultâneos

// 3. HACK: Solução temporária
// HACK: API retorna string ao invés de number, conversão forçada

// 4. NOTE: Informação importante
// NOTE: A API Yuno limita a 100 requests/minuto

// 5. DEPRECATED: Código obsoleto
// @deprecated Use processPaymentV2() ao invés desta função

// 6. WARNING: Atenção especial
// WARNING: Não altere a ordem dos middlewares
```

### 5.3 Documentação de Módulo

```javascript
/**
 * @fileoverview Serviço de integração com a API de pagamentos Yuno.
 *
 * Este módulo fornece funções para:
 * - Criar sessões de checkout
 * - Processar pagamentos
 * - Consultar métodos de pagamento disponíveis
 *
 * @module services/payment
 * @requires ../config/environment
 * @requires ../utils/logger
 *
 * @author Time de Desenvolvimento
 * @version 1.5.0
 * @since 1.0.0
 */
```

---

## 6. Tratamento de Erros

### 6.1 Hierarquia de Erros

```javascript
// src/utils/errors.js

/**
 * Erro base da aplicação
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.code = code
        this.isOperational = true // Erro esperado/tratável

        Error.captureStackTrace(this, this.constructor)
    }

    toJSON() {
        return {
            error: this.name,
            code: this.code,
            message: this.message,
            statusCode: this.statusCode
        }
    }
}

/**
 * Erros de validação (400)
 */
class ValidationError extends AppError {
    constructor(message, details = {}) {
        super(message, 400, 'VALIDATION_ERROR')
        this.details = details
    }
}

/**
 * Erros de autenticação (401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'Não autenticado') {
        super(message, 401, 'AUTHENTICATION_ERROR')
    }
}

/**
 * Erros de autorização (403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'Sem permissão') {
        super(message, 403, 'AUTHORIZATION_ERROR')
    }
}

/**
 * Recurso não encontrado (404)
 */
class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
        super(`${resource} não encontrado`, 404, 'NOT_FOUND')
    }
}

/**
 * Conflito de estado (409)
 */
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT')
    }
}

/**
 * Erro de integração externa (502)
 */
class ExternalServiceError extends AppError {
    constructor(service, originalError) {
        super(`Erro na integração com ${service}`, 502, 'EXTERNAL_SERVICE_ERROR')
        this.service = service
        this.originalError = originalError
    }
}

export {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    ExternalServiceError
}
```

### 6.2 Middleware de Erro

```javascript
// src/middlewares/error.middleware.js

import { AppError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
    // Se já enviou resposta, delega ao handler padrão
    if (res.headersSent) {
        return next(err)
    }

    // Erros operacionais (esperados)
    if (err instanceof AppError) {
        logger.warn({
            type: err.name,
            code: err.code,
            message: err.message,
            path: req.path,
            method: req.method
        })

        return res.status(err.statusCode).json(err.toJSON())
    }

    // Erros de programação (inesperados)
    logger.error({
        type: 'UnhandledError',
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    })

    // Em produção, não expor detalhes do erro
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message

    return res.status(500).json({
        error: 'InternalError',
        code: 'INTERNAL_ERROR',
        message
    })
}
```

### 6.3 Padrão Try-Catch

```javascript
// Serviço
async function processPayment(data) {
    // Validação
    if (!data.amount || data.amount <= 0) {
        throw new ValidationError('Valor inválido', {
            field: 'amount',
            received: data.amount
        })
    }

    try {
        const response = await yunoApi.createPayment(data)
        return response
    } catch (error) {
        // Re-throw se já é AppError
        if (error instanceof AppError) throw error

        // Wrap erros externos
        throw new ExternalServiceError('Yuno', error)
    }
}

// Controller
async function handlePayment(req, res, next) {
    try {
        const result = await processPayment(req.body)
        res.json(result)
    } catch (error) {
        next(error) // Delega para errorHandler
    }
}
```

---

## 7. Logging

### 7.1 Sistema de Log

```javascript
// src/utils/logger.js

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
}

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.INFO

function formatLog(level, data) {
    const timestamp = new Date().toISOString()
    const message = typeof data === 'string' ? { message: data } : data

    return JSON.stringify({
        timestamp,
        level,
        ...message
    })
}

export const logger = {
    error(data) {
        if (currentLevel >= LOG_LEVELS.ERROR) {
            console.error(formatLog('ERROR', data))
        }
    },

    warn(data) {
        if (currentLevel >= LOG_LEVELS.WARN) {
            console.warn(formatLog('WARN', data))
        }
    },

    info(data) {
        if (currentLevel >= LOG_LEVELS.INFO) {
            console.log(formatLog('INFO', data))
        }
    },

    debug(data) {
        if (currentLevel >= LOG_LEVELS.DEBUG) {
            console.log(formatLog('DEBUG', data))
        }
    }
}
```

### 7.2 Contexto de Log

```javascript
// Middleware de request logging
export function requestLogger(req, res, next) {
    const requestId = crypto.randomUUID()
    req.requestId = requestId

    const startTime = Date.now()

    logger.info({
        type: 'REQUEST_START',
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip
    })

    // Interceptar resposta
    const originalJson = res.json.bind(res)
    res.json = (data) => {
        logger.info({
            type: 'REQUEST_END',
            requestId,
            statusCode: res.statusCode,
            duration: Date.now() - startTime
        })
        return originalJson(data)
    }

    next()
}
```

### 7.3 O Que Logar

| Nível | Quando Usar | Exemplos |
|-------|-------------|----------|
| ERROR | Falhas que precisam atenção imediata | Erro de banco de dados, API indisponível |
| WARN | Situações potencialmente problemáticas | Rate limit próximo, retry de operação |
| INFO | Eventos importantes do fluxo normal | Pagamento processado, usuário criado |
| DEBUG | Detalhes para debugging | Payload de requisição, valores de variáveis |

---

## 8. Testes

### 8.1 Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários (isolados)
│   ├── services/
│   │   └── payment.service.test.js
│   └── utils/
│       └── validators.test.js
│
├── integration/             # Testes de integração
│   ├── routes/
│   │   └── payment.routes.test.js
│   └── repositories/
│       └── payment.repository.test.js
│
├── e2e/                     # Testes end-to-end
│   └── checkout-flow.test.js
│
├── fixtures/                # Dados de teste
│   └── payments.json
│
├── mocks/                   # Mocks de serviços externos
│   └── yuno-api.mock.js
│
└── setup.js                 # Configuração global de testes
```

### 8.2 Padrão AAA (Arrange-Act-Assert)

```javascript
// tests/unit/services/payment.service.test.js

describe('PaymentService', () => {
    describe('processPayment', () => {
        it('should process a valid card payment', async () => {
            // ARRANGE - Preparar dados e mocks
            const mockYunoClient = {
                createPayment: jest.fn().mockResolvedValue({
                    id: 'pay_123',
                    status: 'SUCCEEDED'
                })
            }
            const service = new PaymentService(mockYunoClient)
            const paymentData = {
                amount: 1000,
                currency: 'BRL',
                method: 'CARD',
                token: 'tok_test'
            }

            // ACT - Executar ação
            const result = await service.processPayment(paymentData)

            // ASSERT - Verificar resultado
            expect(result.status).toBe('SUCCEEDED')
            expect(result.id).toBe('pay_123')
            expect(mockYunoClient.createPayment).toHaveBeenCalledWith(
                expect.objectContaining({ amount: 1000 })
            )
        })

        it('should throw ValidationError for invalid amount', async () => {
            // ARRANGE
            const service = new PaymentService()
            const invalidData = { amount: -100 }

            // ACT & ASSERT
            await expect(service.processPayment(invalidData))
                .rejects.toThrow(ValidationError)
        })
    })
})
```

### 8.3 Cobertura de Testes

```javascript
// package.json scripts
{
    "scripts": {
        "test": "jest",
        "test:unit": "jest tests/unit",
        "test:integration": "jest tests/integration",
        "test:e2e": "jest tests/e2e",
        "test:coverage": "jest --coverage",
        "test:watch": "jest --watch"
    }
}
```

**Metas de cobertura:**
- Serviços críticos: > 80%
- Utilidades: > 90%
- Controllers: > 70%
- Integrations: > 60% (com mocks)

---

## 9. Versionamento

### 9.1 Semantic Versioning (SemVer)

Formato: `MAJOR.MINOR.PATCH`

| Tipo | Quando incrementar | Exemplo |
|------|-------------------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | Novas funcionalidades retrocompatíveis | 1.0.0 → 1.1.0 |
| PATCH | Correções de bugs | 1.0.0 → 1.0.1 |

### 9.2 Conventional Commits

```bash
# Formato
<type>(<scope>): <description>

[optional body]

[optional footer(s)]

# Tipos
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (não afeta código)
refactor: Refatoração
test:     Adição/correção de testes
chore:    Tarefas de manutenção

# Exemplos
feat(payment): add PIX payment method support
fix(checkout): resolve session expiration issue
docs(readme): update installation instructions
refactor(services): extract validation logic
```

### 9.3 Git Workflow

```
main (ou master)
  │
  ├── develop          # Branch de desenvolvimento
  │     │
  │     ├── feature/   # Novas funcionalidades
  │     │   └── feature/add-pix-payment
  │     │
  │     ├── fix/       # Correções
  │     │   └── fix/checkout-timeout
  │     │
  │     └── refactor/  # Refatorações
  │         └── refactor/payment-service
  │
  └── release/         # Preparação de releases
      └── release/1.5.0
```

### 9.4 .gitignore Padrão

```gitignore
# Dependencies
node_modules/
vendor/
.venv/

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.min.js

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Coverage
coverage/
.nyc_output/

# Secrets
*.pem
*.key
credentials.json
```

---

## 10. Controle de Qualidade

### 10.1 Linting

```javascript
// .eslintrc.js
module.exports = {
    env: {
        node: true,
        es2022: true
    },
    extends: ['eslint:recommended'],
    rules: {
        'no-unused-vars': 'error',
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'eqeqeq': ['error', 'always'],
        'curly': 'error'
    }
}
```

### 10.2 Code Review Checklist

```markdown
## Funcionalidade
- [ ] O código faz o que deveria fazer?
- [ ] Edge cases foram considerados?
- [ ] Não há regressões?

## Design
- [ ] Segue princípios SOLID?
- [ ] Não há código duplicado?
- [ ] Complexidade é adequada?

## Legibilidade
- [ ] Nomes são claros e descritivos?
- [ ] Código é autoexplicativo?
- [ ] Comentários são úteis (não óbvios)?

## Segurança
- [ ] Inputs são validados/sanitizados?
- [ ] Sem segredos no código?
- [ ] Sem vulnerabilidades conhecidas?

## Testes
- [ ] Testes foram adicionados/atualizados?
- [ ] Testes passam?
- [ ] Cobertura adequada?

## Performance
- [ ] Sem N+1 queries?
- [ ] Operações custosas são evitadas?
- [ ] Não há memory leaks?
```

### 10.3 Pipeline CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test:coverage

      - name: Build
        run: npm run build
```

---

## 11. Decisões Arquiteturais (ADRs)

### 11.1 Template ADR

```markdown
# ADR-001: [Título da Decisão]

## Status
[Proposto | Aceito | Depreciado | Substituído por ADR-XXX]

## Contexto
Qual é o problema ou situação que motivou esta decisão?

## Decisão
Qual é a decisão tomada?

## Alternativas Consideradas

### Alternativa A
- Prós: ...
- Contras: ...

### Alternativa B
- Prós: ...
- Contras: ...

## Consequências

### Positivas
- ...

### Negativas
- ...

## Notas
Informações adicionais, links, referências.

---
Data: YYYY-MM-DD
Autores: Nome
```

### 11.2 Exemplo de ADR

```markdown
# ADR-002: Uso de Express.js como Framework HTTP

## Status
Aceito

## Contexto
Precisamos de um framework HTTP para construir a API de pagamentos.
O projeto é um SDK lite para integração com Yuno.

## Decisão
Usar Express.js como framework HTTP.

## Alternativas Consideradas

### Fastify
- Prós: Mais rápido, TypeScript nativo
- Contras: Menos ecosistema, curva de aprendizado

### Koa
- Prós: Mais moderno, async/await nativo
- Contras: Menos middlewares prontos

### Express
- Prós: Maduro, vasto ecosistema, documentação extensa
- Contras: Callback-based (mitigado com async handlers)

## Consequências

### Positivas
- Time já conhece Express
- Muitos middlewares disponíveis
- Fácil encontrar desenvolvedores

### Negativas
- Performance não é a melhor
- Precisa de wrappers para async/await

---
Data: 2024-01-15
Autores: Time de Desenvolvimento
```

---

## 12. Checklist para Novos Projetos

### Fase 1: Inicialização

```markdown
- [ ] Criar repositório Git
- [ ] Configurar .gitignore
- [ ] Inicializar package.json (ou equivalente)
- [ ] Criar estrutura de diretórios base
- [ ] Configurar .env.example
- [ ] Criar README.md inicial
```

### Fase 2: Configuração

```markdown
- [ ] Configurar linter (ESLint, etc)
- [ ] Configurar formatter (Prettier, etc)
- [ ] Configurar framework de testes
- [ ] Criar scripts npm básicos (start, test, lint)
- [ ] Configurar variáveis de ambiente
```

### Fase 3: Infraestrutura de Código

```markdown
- [ ] Criar sistema de logging
- [ ] Criar classes de erro customizadas
- [ ] Criar middleware de erro
- [ ] Configurar sistema de configuração
- [ ] Criar utilitários base
```

### Fase 4: Documentação

```markdown
- [ ] Documentar arquitetura (este documento)
- [ ] Criar template de ADR
- [ ] Documentar API (OpenAPI/Swagger se aplicável)
- [ ] Criar guia de contribuição
- [ ] Documentar processo de deploy
```

### Fase 5: CI/CD

```markdown
- [ ] Configurar pipeline de CI
- [ ] Configurar análise de cobertura
- [ ] Configurar deploy automatizado
- [ ] Configurar ambientes (dev, staging, prod)
```

---

## Referências

- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Twelve-Factor App](https://12factor.net/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ADR - Architecture Decision Records](https://adr.github.io/)

---

*Este documento é um guia vivo. Atualize-o conforme o projeto evolui.*
