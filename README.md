# GlobeTrans Order Preparation App

Lightweight order-preparation interface for logistics operations. The app collects shipment/order details, validates input, and submits clean JSON payloads to either a webhook endpoint or Airtable.

## Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn-style UI primitives
- React Hook Form + Zod validation
- Framer Motion animations
- Axios API layer

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Environment

Copy values from `.env.example` into `.env`.

- `VITE_SUBMISSION_TARGET=webhook|airtable`
- `VITE_ORDER_WEBHOOK_URL=...`
- `VITE_AIRTABLE_API_KEY=...`
- `VITE_AIRTABLE_BASE_ID=...`
- `VITE_AIRTABLE_TABLE_NAME=...`
- `VITE_AIRTABLE_FIELD_MAP_JSON=...` (optional strict map override)

Example Airtable map JSON keys (all required when provided):

- `orderId`, `date`, `warehouse`, `destination`, `deliveryType`
- `senderFullName`, `senderPhone`, `senderEmail`
- `receiverFullName`, `receiverPhone`, `receiverAddress`, `receiverCity`
- `itemsJson`, `notes`, `createdAt`

## Feature-Based Architecture

```text
src/
	features/
		order-preparation/
			api/
			components/
			model/
			OrderPreparationPage.tsx
			index.ts
	components/ui/
	hooks/
	lib/
```

## Draft Persistence

- Draft is saved per-step (not whole-form snapshots).
- Each step is restored independently on reload.
- Draft keys are cleared after successful submission.
