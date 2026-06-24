# ADR-003: Cliente HTTP Abstrato para Yuno API

## Status
Aceito

## Contexto
As chamadas a API Yuno estavam duplicadas em varias funcoes:
- Mesmos headers sendo configurados em cada funcao
- Tratamento de erro duplicado
- Logging inconsistente

## Decisao
Criar classe `YunoClient` que encapsula:
- Configuracao de headers padrao
- Logging automatico de request/response
- Tratamento de erro centralizado
- Metodos convenientes (get, post, put, delete)

```javascript
class YunoClient {
    getHeaders()           // Headers padrao
    request(options)       // Metodo base
    get(endpoint)          // Wrapper GET
    post(endpoint, body)   // Wrapper POST
}
```

### Uso
```javascript
// Antes
const response = await fetch(`${API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
        'public-api-key': PUBLIC_API_KEY,
        'private-secret-key': PRIVATE_SECRET_KEY,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
})

// Depois
const response = await yunoClient.post('/v1/payments', payment, {
    name: 'CREATE_PAYMENT'
})
```

## Alternativas Consideradas

### 1. Manter fetch direto
- Pros: Sem abstracao adicional
- Contras: Codigo duplicado, dificil manter

### 2. Usar axios
- Pros: Interceptors, cancelamento
- Contras: Dependencia adicional, fetch nativo e suficiente

### 3. Cliente customizado (escolhido)
- Pros: Controle total, logging integrado
- Contras: Mais codigo inicial

## Consequencias

### Positivas
- Codigo DRY (Don't Repeat Yourself)
- Facil alterar configuracao global
- Logging automatico de todas as chamadas
- Tratamento de erro consistente

### Negativas
- Uma camada adicional de abstracao
- Precisa ser atualizado se API mudar significativamente

---
Data: 2024-01-15
Autores: Time de Desenvolvimento
