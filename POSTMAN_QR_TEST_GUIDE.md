# QR Payment Flow Testing Guide - Postman

## Luong test nhanh nhat

Voi thanh toan truc tuyen, he thong **chua tao Order ngay**. Order chi duoc tao sau khi mock thanh toan thanh cong.

```
Web hien PAY_xxx
       ↓
GET /api/payments/PAY_xxx/dev-info
       ↓
Copy token
       ↓
POST /api/payments/PAY_xxx/mock-confirm
Body: { "token": "..." }
       ↓
Backend tu sinh transactionId
       ↓
Backend tao Order va cap nhat Paid/Confirmed
       ↓
Web polling thay Paid va tu chuyen sang thanh cong
```

## 1. Tao phien QR tren web

1. Vao `/checkout`
2. Chon san pham va dien thong tin
3. Chon **Thanh toan truc tuyen**
4. Bam thanh toan
5. Web chuyen toi:

```text
/payment/waiting/PAY_ABC123
```

Lay `PAY_ABC123` tren URL de test Postman.

Ket qua luc nay:

- Co `PaymentSession`
- `orderId = null`
- Chua co Order trong bang `Orders`
- Man QR dem nguoc 15 phut

## 2. Lay token

Request:

```http
GET http://localhost:5001/api/payments/PAY_ABC123/dev-info
```

Response vi du:

```json
{
  "sessionId": "PAY_ABC123",
  "token": "6e8f9a6a-ae72-4346-994f-b63ff9b4a53e",
  "amount": 33140000,
  "orderId": null,
  "status": "Pending",
  "expiresAt": "2026-06-13T16:46:11.1347652Z"
}
```

Chi can copy `token`.

## 3. Mock confirm thanh toan

Request:

```http
POST http://localhost:5001/api/payments/PAY_ABC123/mock-confirm
Content-Type: application/json
```

Body raw:

```json
{
  "token": "6e8f9a6a-ae72-4346-994f-b63ff9b4a53e"
}
```

Khong can gui:

- `sessionId` vi da co tren URL
- `amount` vi backend lay tu PaymentSession
- `status` vi mac dinh la `SUCCESS`
- `transactionId` vi backend tu sinh

Response vi du:

```json
{
  "success": true,
  "status": "Paid",
  "orderId": 42,
  "orderCode": "CNTHHT-20260613-0042",
  "paymentStatus": "Paid",
  "orderStatus": "Confirmed",
  "paidAt": "2026-06-13T16:55:23.001Z",
  "transactionId": "MOCK20260613165523001"
}
```

Sau response:

- `PaymentSessions.Status = Paid`
- `Orders` moi duoc tao
- `Orders.PaymentStatus = Paid`
- `Orders.Status = Confirmed`
- Web tu nhay sang man thanh toan thanh cong

## Test thanh toan that bai

Neu muon test fail, body raw:

```json
{
  "token": "6e8f9a6a-ae72-4346-994f-b63ff9b4a53e",
  "status": "FAILED"
}
```

## Postman Collection JSON

```json
{
  "info": {
    "name": "QR Payment Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Get Dev Info",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5001/api/payments/PAY_ABC123/dev-info",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "payments", "PAY_ABC123", "dev-info"]
        }
      }
    },
    {
      "name": "2. Mock Confirm Payment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"token\": \"6e8f9a6a-ae72-4346-994f-b63ff9b4a53e\"\n}"
        },
        "url": {
          "raw": "http://localhost:5001/api/payments/PAY_ABC123/mock-confirm",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "payments", "PAY_ABC123", "mock-confirm"]
        }
      }
    }
  ]
}
```

## Loi thuong gap

### `dev-info` tra 404

`ASPNETCORE_ENVIRONMENT` phai la `Development`.

### `mock-confirm` tra 404

Endpoint nay chi mo trong `Development`.

### Token khong hop le

Lay lai token bang `/dev-info` cua dung `sessionId`.

### Phien da het han

Phien QR co TTL 15 phut. Tao lai phien moi tu checkout.

## Khi tich hop cong that

Voi VNPay, MoMo, VietQR webhook that:

1. Cong thanh toan tao/tra ma giao dich.
2. Webhook backend validate chu ky.
3. Backend gan `TransactionId` tu cong thanh toan.
4. Backend tao Order va cap nhat `Paid/Confirmed`.
