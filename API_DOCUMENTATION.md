# API REST - Sistema de Apostas Aviator

## Visão Geral
Este documento descreve a API REST completa do sistema de apostas Aviator, incluindo autenticação, apostas, transações e gerenciamento de jogos.

**Base URL:** `https://tnagnwcrjjtydqcosmrr.supabase.co`

## Autenticação

Todas as APIs protegidas requerem autenticação via Bearer Token:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obter Token de Autenticação

**Endpoint:** `POST /auth/v1/token`

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "7e3148b4-38f6-4a46-85bc-c7860033ffab",
    "email": "usuario@exemplo.com"
  }
}
```

## Edge Functions (APIs Customizadas)

### 1. Fazer Aposta

**Endpoint:** `POST /functions/v1/place-bet`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "amount": 100.00,
  "round_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "bet_id": "550e8400-e29b-41d4-a716-446655440001",
  "new_balance": 900.00
}
```

**Resposta de Erro:**
```json
{
  "error": "Insufficient balance"
}
```

### 2. Sacar Aposta (Cash Out)

**Endpoint:** `POST /functions/v1/cash-out`

**Body:**
```json
{
  "bet_id": "550e8400-e29b-41d4-a716-446655440001",
  "multiplier": 2.5
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "win_amount": 250.00,
  "profit": 150.00,
  "new_balance": 1150.00
}
```

### 3. Depósito via Gibrapay

**Endpoint:** `POST /functions/v1/gibrapay-deposit`

**Body:**
```json
{
  "amount": 500.00,
  "phone": "+258123456789"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "transaction_id": "550e8400-e29b-41d4-a716-446655440002",
  "payment_url": "https://gibrapay.online/pay/550e8400-e29b-41d4-a716-446655440002",
  "reference": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 500.00,
  "message": "Deposit initiated. Complete payment on Gibrapay."
}
```

### 4. Gerenciar Jogo

**Endpoint:** `POST /functions/v1/game-manager`

**Body (Iniciar Rodada):**
```json
{
  "action": "start_round"
}
```

**Body (Finalizar Rodada):**
```json
{
  "action": "end_round",
  "multiplier": 2.34
}
```

**Resposta:**
```json
{
  "success": true,
  "round_id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "active"
}
```

## Supabase REST API (Dados)

### Perfis de Usuário

**Endpoint:** `GET /rest/v1/profiles`

**Headers:**
```
Authorization: Bearer <token>
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Filtros disponíveis:**
- `?id=eq.7e3148b4-38f6-4a46-85bc-c7860033ffab`
- `?email=eq.usuario@exemplo.com`

**Resposta:**
```json
[
  {
    "id": "7e3148b4-38f6-4a46-85bc-c7860033ffab",
    "email": "usuario@exemplo.com",
    "full_name": "João Silva",
    "phone": "+258123456789",
    "balance": 1000.00,
    "total_deposited": 2000.00,
    "total_withdrawn": 500.00,
    "total_bet": 1500.00,
    "total_won": 1200.00,
    "kyc_status": "approved",
    "is_active": true,
    "is_verified": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-02T00:00:00.000Z"
  }
]
```

### Apostas

**Endpoint:** `GET /rest/v1/bets`

**Filtros disponíveis:**
- `?user_id=eq.7e3148b4-38f6-4a46-85bc-c7860033ffab`
- `?round_id=eq.550e8400-e29b-41d4-a716-446655440000`
- `?status=eq.active`
- `?order=created_at.desc`
- `?limit=10`

**Resposta:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "7e3148b4-38f6-4a46-85bc-c7860033ffab",
    "round_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 100.00,
    "cash_out_multiplier": 2.5,
    "potential_win": 250.00,
    "actual_win": 250.00,
    "status": "won",
    "placed_at": "2025-01-01T10:00:00.000Z",
    "cashed_out_at": "2025-01-01T10:01:30.000Z",
    "created_at": "2025-01-01T10:00:00.000Z"
  }
]
```

### Rodadas do Jogo

**Endpoint:** `GET /rest/v1/game_rounds`

**Filtros disponíveis:**
- `?is_active=eq.true`
- `?order=created_at.desc`
- `?limit=20`

**Resposta:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "seed_hash": "a1b2c3d4e5f6...",
    "multiplier": 2.34,
    "is_active": false,
    "created_at": "2025-01-01T10:00:00.000Z",
    "started_at": "2025-01-01T10:00:05.000Z",
    "crashed_at": "2025-01-01T10:01:45.000Z"
  }
]
```

### Transações

**Endpoint:** `GET /rest/v1/transactions`

**Filtros disponíveis:**
- `?user_id=eq.7e3148b4-38f6-4a46-85bc-c7860033ffab`
- `?type=eq.deposit`
- `?status=eq.completed`
- `?order=created_at.desc`

**Resposta:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "7e3148b4-38f6-4a46-85bc-c7860033ffab",
    "type": "deposit",
    "amount": 500.00,
    "status": "completed",
    "payment_provider": "gibrapay",
    "external_transaction_id": "GP_1704067200000",
    "description": "Deposit via Gibrapay - 500 MZN",
    "metadata": {
      "phone": "+258123456789",
      "request_time": "2025-01-01T09:00:00.000Z"
    },
    "created_at": "2025-01-01T09:00:00.000Z",
    "updated_at": "2025-01-01T09:05:00.000Z"
  }
]
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito (ex: aposta já existe) |
| 500 | Erro interno do servidor |

## Tipos de Dados

### Status de Aposta
- `active` - Aposta ativa
- `won` - Aposta ganha (sacada)
- `lost` - Aposta perdida

### Status de Transação
- `pending` - Pendente
- `completed` - Completada
- `failed` - Falhada
- `cancelled` - Cancelada

### Tipos de Transação
- `deposit` - Depósito
- `withdrawal` - Saque
- `bet` - Aposta
- `win` - Ganho

### Status KYC
- `not_submitted` - Não enviado
- `pending` - Pendente
- `approved` - Aprovado
- `rejected` - Rejeitado

## Webhooks (Opcionais)

Para integração em tempo real, você pode configurar webhooks para:

- Novos depósitos confirmados
- Apostas realizadas
- Rodadas iniciadas/finalizadas
- Mudanças de status KYC

**Formato do Webhook:**
```json
{
  "event": "deposit.completed",
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "7e3148b4-38f6-4a46-85bc-c7860033ffab",
    "amount": 500.00
  },
  "timestamp": "2025-01-01T09:05:00.000Z"
}
```

## Limitações e Regras de Negócio

- **Aposta mínima:** 10 MZN
- **Aposta máxima:** 100,000 MZN
- **Depósito mínimo:** 10 MZN
- **Depósito máximo:** 100,000 MZN
- **Rate limiting:** 100 requests/minuto por usuário
- **Uma aposta por rodada por usuário**

## Ambientes

### Produção
- **Base URL:** `https://tnagnwcrjjtydqcosmrr.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYWdud2Nyamp0eWRxY29zbXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQ1MTYsImV4cCI6MjA2OTI3MDUxNn0.qk97eez3Q-XRonKP710zDGGbULzSZxaYkIKu9iOcv-U`

## Exemplos de Integração

### JavaScript/Node.js
```javascript
const API_BASE = 'https://tnagnwcrjjtydqcosmrr.supabase.co';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Fazer aposta
async function placeBet(token, amount, roundId) {
  const response = await fetch(`${API_BASE}/functions/v1/place-bet`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount,
      round_id: roundId
    })
  });
  
  return await response.json();
}

// Obter histórico de apostas
async function getBetHistory(token, userId) {
  const response = await fetch(
    `${API_BASE}/rest/v1/bets?user_id=eq.${userId}&order=created_at.desc`, 
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': API_KEY
      }
    }
  );
  
  return await response.json();
}
```

### cURL
```bash
# Fazer login
curl -X POST https://tnagnwcrjjtydqcosmrr.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","password":"senha123"}'

# Fazer aposta
curl -X POST https://tnagnwcrjjtydqcosmrr.supabase.co/functions/v1/place-bet \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":100.00,"round_id":"550e8400-e29b-41d4-a716-446655440000"}'
```

## Suporte

Para dúvidas sobre a API, entre em contato com a equipe de desenvolvimento.