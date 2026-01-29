# Backend Documentation (Yii2 + MySQL)

## Setup

1.  **Database**: Ensure MySQL is running and `rfq_db` exists.
2.  **Migrations**: Run `php yii migrate`.
3.  **Seed Data**: Run `php yii seed` to populate categories.

## API Endpoints (Base URL: `/index.php` or pretty URL if configured)

### Auth
- `POST /api/auth/register`: `{email, password, role, name}`
- `POST /api/auth/login`: `{email, password}` -> Returns `access_token`
- `GET /api/auth/me`: Headers `Authorization: Bearer <token>`

### RFQs
- `GET /api/rfq`: List requests (Role aware).
- `POST /api/rfq`: Create request (User only).
- `GET /api/rfq/{id}`: View details.

### Quotations
- `GET /api/quotation?rfqId={id}`: List quotes for RFQ.
- `POST /api/quotation`: `{rfq_id, price_per_unit, ...}` (Company only).
- `POST /api/quotation/{id}/accept`: (User only).
- `POST /api/quotation/{id}/reject`: (User only).

## WebSocket Server (Real-time)

To enable real-time notifications, run the WebSocket server in a separate terminal:

```bash
php yii server
```

- **Listening on**: `ws://localhost:8080`
- **Internal API Trigger**: `tcp://127.0.0.1:8081`

The API automatically pushes events to the WS server when RFQs are created or Quotes are submitted/accepted.
