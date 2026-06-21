# Fees Frontend

A React + TypeScript frontend for the Fees billing API.

## Prerequisites

- Node.js 18+
- npm
- The `fees-api` backend running locally on port 4000 (via `encore run`)

## Setup

1. Install dependencies:

```bash
cd fees-frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

## API Proxy

The Vite dev server proxies all `/api/*` requests to `http://localhost:4000` (with the `/api` prefix stripped). This means the backend must be running locally with Encore:

```bash
cd fees-api
encore run
```

## Usage

1. **Register** - Create a new customer account. You'll receive an API key (shown once).
2. **Sign In** - Paste your API key to authenticate.
3. **Bills** - Create bills, view details, add line items, and close bills.
4. **Currencies** - View available currencies.
5. **Account** - View your profile and rotate your API key.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server, and configure your reverse proxy to forward API calls to the backend.
