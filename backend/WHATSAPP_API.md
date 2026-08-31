# WhatsApp Communication API

Base path: `/api/v1/whatsapp`. Every endpoint requires a StayHub bearer token and returns `{ success, message, data, timestamp }`.

## Send a message

```http
POST /api/v1/whatsapp/send
Authorization: Bearer <token>
Content-Type: application/json

{"tenantId":"tenant_cuid","message":"Your rent reminder is due today.","idempotencyKey":"rent-2026-08-tenant_cuid"}
```

## Send reminders

```json
{
  "tenantIds": ["tenant_cuid"],
  "reminderType": "OVERDUE",
  "message": "Your rent is overdue. Please contact management."
}
```

## Share a receipt

```json
{ "receiptId": "receipt_cuid" }
```

## Broadcast

```json
{ "propertyIds": ["property_cuid"], "message": "Two beds are available this month." }
```

## Schedule

```json
{
  "tenantId": "tenant_cuid",
  "message": "Rent is due tomorrow.",
  "scheduledAt": "2026-08-06T09:00:00.000Z"
}
```

A provider failure marks the log `FAILED`, stores a redacted error, and records retry metadata. Idempotency keys return the existing message record on retry. `WHATSAPP_PROVIDER=mock` is the default for local development; production Twilio mode requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_FROM`.
