# Sistema de Notificaciones Automáticas para Pagos Verificados

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de notificaciones automáticas que envía alertas tanto al **pasajero** como al **conductor** cuando un pago es verificado automáticamente por el servicio externo.

---

## 📋 Archivos Creados/Modificados

### ✨ Archivos Nuevos:

1. **`src/app/api/webhooks/payment-verified/route.ts`**
   - Webhook que recibe notificaciones del servicio de verificación de pagos
   - Valida seguridad mediante secret compartido
   - Dispara evento Inngest para procesamiento en background

2. **`src/utils/inngest/send-payment-verified-notifications.ts`**
   - Función Inngest que procesa las notificaciones
   - Envía 4 notificaciones: 2 WebSocket + 2 Emails (pasajero + conductor)
   - Maneja reintentos automáticos (5 retries)

3. **`src/emails/templates/PaymentVerifiedPassenger.tsx`**
   - Template de email para el pasajero
   - Incluye detalles del viaje y confirmación de pago

4. **`src/emails/templates/PaymentVerifiedDriver.tsx`**
   - Template de email para el conductor
   - Notifica nuevo pasajero confirmado con detalles

### 📝 Archivos Modificados:

1. **`src/lib/inngest.ts`**
   - Agregado tipo de evento: `payment-verified-notification`

2. **`src/services/email/email-service.ts`**
   - Agregados métodos:
     - `sendPaymentVerifiedEmailToPassenger()`
     - `sendPaymentVerifiedEmailToDriver()`

3. **`src/app/api/inngest/route.ts`**
   - Registrada función `sendPaymentVerifiedNotifications`

4. **`src/emails/index.ts`**
   - Exportados nuevos templates

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno - Main App (Next.js)

Agregar a tu archivo `.env`:

```bash
# Webhook Security
PAYMENT_WEBHOOK_SECRET=tu_secret_super_seguro_aqui_12345
```

### 2. Variables de Entorno - Server.js (Servicio de Verificación)

Agregar a tu archivo `.env` del servicio de verificación:

```bash
# Webhook Configuration
NEXT_APP_WEBHOOK_URL=https://tu-dominio.com/api/webhooks/payment-verified
# O en desarrollo:
# NEXT_APP_WEBHOOK_URL=http://localhost:3000/api/webhooks/payment-verified

WEBHOOK_SECRET=tu_secret_super_seguro_aqui_12345
```

**IMPORTANTE:** El `WEBHOOK_SECRET` debe ser **exactamente el mismo** en ambos servicios.

---

## 🔗 Modificaciones en server.js

En tu archivo `server.js`, después de completar exitosamente la verificación del pago (después del `COMMIT`), agregar el siguiente código:

### Ubicación: Dentro del endpoint `/api/payments/verify`

```javascript
// ... código existente ...

await client.query('COMMIT');

// ✅ AGREGAR ESTE CÓDIGO AQUÍ:
// Notify Next.js app about successful payment verification
try {
  const webhookUrl = process.env.NEXT_APP_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/payment-verified';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET || ''
    },
    body: JSON.stringify({
      paymentId: matchedPayment.payment_id,
      amount: parseFloat(amount),
      senderName: senderName
    })
  });

  console.log('[Webhook] Payment verification notification sent to main app');
} catch (webhookError) {
  // Don't fail the payment if webhook fails, just log it
  console.error('[Webhook] Failed to send notification to main app:', webhookError);
}
// FIN DEL CÓDIGO A AGREGAR ✅

// Log successful verification (código existente)
await pool.query(
  `INSERT INTO "PaymentVerificationLog" ("senderName", amount, success, message, "paymentId")
   VALUES ($1, $2, $3, $4, $5)`,
  [senderName, amount, true, 'Pago verificado exitosamente', matchedPayment.payment_id]
);

// ... resto del código existente ...
```

---

## 🔄 Flujo Completo

```
1. server.js verifica pago automáticamente
   ↓
2. Actualiza Payment.status → COMPLETED
   ↓
3. Actualiza TripPassenger.reservationStatus → CONFIRMED
   ↓
4. Actualiza Trip.remainingSeats
   ↓
5. COMMIT exitoso
   ↓
6. 🆕 Envía POST al webhook de Next.js
   ↓
7. Webhook valida secret y dispara Inngest
   ↓
8. Inngest Job (background):
   a. Consulta datos completos del pago
   b. Envía notificación WebSocket al pasajero ✅
   c. Envía notificación WebSocket al conductor ✅
   d. Envía email al pasajero 📧
   e. Envía email al conductor 📧
   f. Registra logs en la base de datos
```

---

## 📬 Notificaciones Enviadas

### Para el Pasajero:

**WebSocket (Tiempo Real):**
- 🔔 Título: "¡Pago verificado!"
- 💬 Mensaje: "Tu pago de $XX.XX para el viaje de [Origen] a [Destino] ha sido verificado automáticamente. ¡Estás confirmado para viajar!"
- 🔗 Link: `/viajes/{tripId}`

**Email:**
- 📧 Asunto: "¡Tu pago ha sido confirmado!"
- ✅ Confirmación con todos los detalles del viaje
- 🎫 Información de asientos, fecha, hora
- 🔗 Botón CTA: "Ver Detalles del Viaje"

### Para el Conductor:

**WebSocket (Tiempo Real):**
- 🔔 Título: "Nuevo pasajero confirmado"
- 💬 Mensaje: "[Nombre] confirmó su pago de $XX.XX para tu viaje de [Origen] a [Destino]"
- 🔗 Link: `/conductor/viajes/{tripId}`

**Email:**
- 📧 Asunto: "Nuevo pasajero confirmado en tu viaje"
- 👤 Información del pasajero
- 💺 Asientos reservados
- 📍 Detalles del viaje
- 🔗 Botón CTA: "Ver Viaje"

---

## 🧪 Testing

### 1. Probar el Webhook Manualmente

```bash
curl -X POST http://localhost:3000/api/webhooks/payment-verified \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: tu_secret_super_seguro_aqui_12345" \
  -d '{
    "paymentId": "payment-id-existente-en-bd",
    "amount": 1500,
    "senderName": "Juan Perez"
  }'
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Notification job queued successfully",
  "paymentId": "payment-id-existente-en-bd"
}
```

### 2. Verificar en Inngest Dashboard

1. Ir a: http://localhost:8288 (desarrollo) o tu Inngest dashboard
2. Buscar el evento: `payment-verified-notification`
3. Verificar que los 6 steps se ejecutaron correctamente:
   - ✅ Fetch payment data
   - ✅ Notify passenger WebSocket
   - ✅ Notify driver WebSocket
   - ✅ Send passenger email
   - ✅ Send driver email
   - ✅ Log notification success

### 3. Verificar en Base de Datos

```sql
-- Ver notificaciones creadas
SELECT * FROM "Notification"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
ORDER BY "createdAt" DESC;

-- Ver logs de acciones
SELECT * FROM "UserActionLog"
WHERE action = 'PAGO_COMPLETADO'
ORDER BY timestamp DESC;
```

### 4. Testing de Seguridad

**Secret Incorrecto (debe fallar):**
```bash
curl -X POST http://localhost:3000/api/webhooks/payment-verified \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: secret_incorrecto" \
  -d '{"paymentId":"123","amount":1500,"senderName":"Test"}'
```

**Respuesta Esperada:** `401 Unauthorized`

---

## 🔒 Seguridad

1. **Validación de Secret:** El webhook valida que el header `X-Webhook-Secret` coincida
2. **Validación de Datos:** Zod valida que los datos recibidos sean correctos
3. **Idempotencia:** Si el pago ya está COMPLETED, no se reenvían notificaciones
4. **Non-Blocking:** Si el webhook falla, el pago YA está verificado en BD
5. **Reintentos:** Inngest reintenta automáticamente hasta 5 veces si hay errores

---

## 📊 Monitoreo

### Logs a Revisar:

**En server.js:**
```
[Webhook] Payment verification notification sent to main app
```

**En Next.js (Webhook):**
```
[Webhook] Payment verified webhook received: { paymentId, amount, senderName }
[Webhook] Payment verification notification job queued successfully
```

**En Inngest:**
```
[Inngest] Processing payment verification notifications for payment {id}
[Inngest] Payment data fetched - Passenger: X, Driver: Y
[Inngest] WebSocket notification sent to passenger X
[Inngest] WebSocket notification sent to driver Y
[Inngest] Email sent to passenger email@example.com
[Inngest] Email sent to driver email@example.com
[Inngest] All notifications sent successfully for payment {id}
```

---

## 🐛 Troubleshooting

### Error: "Unauthorized"
- ✅ Verificar que `PAYMENT_WEBHOOK_SECRET` sea idéntico en ambos servicios
- ✅ Verificar que el header `X-Webhook-Secret` se esté enviando correctamente

### Error: "Payment not found"
- ✅ Verificar que el `paymentId` exista en la base de datos
- ✅ Verificar que el pago esté en estado `COMPLETED`

### Emails no se envían
- ✅ Verificar que `RESEND_API_KEY` esté configurado
- ✅ Revisar logs de Inngest para ver errores
- ✅ Verificar que los templates de email se importen correctamente

### WebSocket no llega
- ✅ Verificar que `WEBSOCKET_SERVER_URL` esté configurado
- ✅ Revisar que `notifyUser()` no esté lanzando errores
- ✅ Verificar que el usuario esté conectado al WebSocket

---

## 🎯 Próximos Pasos

1. **Configurar Variables de Entorno** en ambos servicios
2. **Modificar server.js** para agregar el llamado al webhook
3. **Reiniciar ambos servicios** para aplicar cambios
4. **Probar el flujo completo** con un pago real o de prueba
5. **Monitorear logs** para verificar que todo funcione correctamente

---

## 📞 Soporte

Si tienes algún problema:

1. Revisar los logs de ambos servicios
2. Verificar el Inngest dashboard para ver errores
3. Revisar este documento para configuración correcta
4. Verificar que todas las variables de entorno estén configuradas

---

**¡Sistema listo para producción!** 🚀
