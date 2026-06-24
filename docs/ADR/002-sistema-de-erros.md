# ADR-002: Sistema de Erros Customizado

## Status
Aceito

## Contexto
O tratamento de erros estava inconsistente:
- Alguns erros retornavam como `{ error: ... }`
- Outros como `{ message: ... }`
- Codigos HTTP variavam para erros similares
- Dificil distinguir erros operacionais de erros de programacao

## Decisao
Implementar hierarquia de erros customizados:

```javascript
AppError (base)
  ├── ValidationError (400)
  ├── AuthenticationError (401)
  ├── AuthorizationError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  ├── PaymentError (400)
  ├── InvalidCheckoutSessionError (400)
  └── ExternalServiceError (502)
```

### Caracteristicas
1. **isOperational**: Flag para distinguir erros esperados de bugs
2. **toJSON()**: Serializacao consistente
3. **Middleware centralizado**: Um unico ponto de tratamento

## Alternativas Consideradas

### 1. Usar apenas Error nativo
- Pros: Simples
- Contras: Sem metadados, tratamento inconsistente

### 2. Biblioteca externa (boom, http-errors)
- Pros: Solucao pronta
- Contras: Dependencia adicional, menos controle

### 3. Erros customizados (escolhido)
- Pros: Controle total, sem dependencias
- Contras: Mais codigo para manter

## Consequencias

### Positivas
- Respostas de erro padronizadas
- Facil adicionar novos tipos de erro
- Logging estruturado de erros
- Melhor debugging

### Negativas
- Curva de aprendizado para usar corretamente
- Necessario manter hierarquia atualizada

---
Data: 2024-01-15
Autores: Time de Desenvolvimento
