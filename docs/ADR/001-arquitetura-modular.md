# ADR-001: Arquitetura Modular com Separacao de Responsabilidades

## Status
Aceito

## Contexto
O projeto SDK Lite 1.5 cresceu organicamente e acumulou todo o codigo em dois arquivos principais (`server.js` e `yuno.js`). Isso dificultava:
- Manutencao do codigo
- Testes unitarios
- Adicao de novas funcionalidades
- Onboarding de novos desenvolvedores

## Decisao
Adotar uma arquitetura modular seguindo o padrao MVC adaptado com:

```
src/
  config/       # Configuracoes centralizadas
  controllers/  # Handlers HTTP (entrada)
  services/     # Logica de negocio
  routes/       # Definicao de rotas
  middlewares/  # Middlewares Express
  utils/        # Utilitarios (errors, logger)
  integrations/ # Clientes de APIs externas
```

### Fluxo de Dados
```
Request -> Routes -> Controllers -> Services -> Integrations -> Yuno API
                                                           <- Response
```

## Alternativas Consideradas

### 1. Manter estrutura atual
- Pros: Nenhuma mudanca necessaria
- Contras: Divida tecnica continua crescendo

### 2. Monolito organizado (escolhido)
- Pros: Simples, adequado para o tamanho do projeto
- Contras: Pode precisar evoluir para microservicos futuramente

### 3. Microservicos
- Pros: Escalabilidade, deploys independentes
- Contras: Complexidade excessiva para o tamanho atual

## Consequencias

### Positivas
- Codigo mais testavel
- Separacao clara de responsabilidades
- Facilidade para adicionar novos metodos de pagamento
- Melhor experiencia de desenvolvimento

### Negativas
- Mais arquivos para navegar
- Necessidade de imports entre modulos

---
Data: 2024-01-15
Autores: Time de Desenvolvimento
