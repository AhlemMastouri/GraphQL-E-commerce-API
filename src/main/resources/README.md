# GraphQL Dashboard — Frontend React

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
# → http://localhost:5173
# Le proxy redirige automatiquement vers Spring Boot sur :8080
```

## Build pour production

```bash
npm run build
# Copier dist/ dans src/main/resources/static/ du projet Spring Boot
cp -r dist/* ../src/main/resources/static/
```

## Structure

```
src/
├── graphql/
│   ├── client.js        ← fetch HTTP + WebSocket
│   └── operations.js    ← queries / mutations / subscriptions
├── hooks/
│   └── useGraphQL.js    ← useQuery / useMutation
├── pages/
│   ├── Products.jsx
│   ├── Orders.jsx
│   ├── Categories.jsx
│   └── Users.jsx
├── App.jsx
└── main.jsx
```

## Backend requis

Spring Boot sur `http://localhost:8080` avec :
- `POST /graphql` — endpoint GraphQL
- `WS /graphql-ws` — WebSocket pour les subscriptions
