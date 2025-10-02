# Reglas de Negocio para Pagos - Tengo Lugar

**Sistema de pagos por transferencia bancaria para confirmación de reservas**

---

## ⚠️ REGLA FUNDAMENTAL DEL SISTEMA DE PAGOS

**TODA RESERVA APROBADA DEBE SER PAGADA PARA SER CONFIRMADA**

Esta es la base del flujo de reservaciones de Tengo Lugar:

- Una reserva **APROBADA** NO garantiza el lugar en el viaje
- Solo las reservas **CONFIRMED** (pagadas) están garantizadas
- El pago es **OBLIGATORIO** para pasar de `APPROVED` → `CONFIRMED`
- **Método único**: Transferencia bancaria con comprobante vía WhatsApp

---

## 1. Flujo de Aprobación y Pago

### 1.1 Estados de Reserva y Pago

```
PENDING_APPROVAL → APPROVED → CONFIRMED → COMPLETED
                      ↓            ↓
                   EXPIRED    CANCELLED_*
```

**Estados explicados:**

| Estado | Descripción | Pago Requerido | Lugar Garantizado |
|--------|-------------|----------------|-------------------|
| `PENDING_APPROVAL` | Esperando aprobación del conductor | ❌ No | ❌ No |
| `APPROVED` | Aprobado, pendiente de pago | ⏳ Sí | ⚠️ Protegido* |
| `CONFIRMED` | Pagado y confirmado | ✅ Completado | ✅ Sí |
| `EXPIRED` | Expiró sin pagar | ❌ No aplicó | ❌ No |
| `COMPLETED` | Viaje realizado | ✅ Completado | ✅ Sí |

**\* Protección de Estado APPROVED:**
- El pasajero en estado `APPROVED` tiene **protección limitada** contra cancelación arbitraria del conductor
- El conductor solo puede bajar al pasajero dentro de **ventanas de tiempo específicas** desde la aprobación:
  - **Viaje >24h**: 8 horas desde aprobación
  - **Viaje 12-24h**: 4 horas desde aprobación
  - **Viaje <12h**: 2 horas desde aprobación
- Fuera de estas ventanas, el pasajero está protegido y solo puede ser removido por soporte con justificación válida
- Ver [REGLAS_DE_NEGOCIO_CANCELACIONES.md - Sección 2.5.1](./REGLAS_DE_NEGOCIO_CANCELACIONES.md) para detalles completos

### 1.2 Ventana de Tiempo para Pagar

**Condiciones:**

- El pasajero tiene **48 horas** desde la aprobación para realizar el pago
- Si el viaje es en menos de 48 horas, debe pagar antes de **24 horas** previas a la salida
- Pasadas estas ventanas, la reserva expira automáticamente

**Ejemplo 1 - Viaje lejano:**
- Viaje programado: 15 de enero a las 10:00
- Aprobación: 1 de enero a las 14:00
- Límite de pago: 3 de enero a las 14:00 (48 horas después)

**Ejemplo 2 - Viaje cercano:**
- Viaje programado: 5 de enero a las 10:00
- Aprobación: 4 de enero a las 18:00 (menos de 48h al viaje)
- Límite de pago: 4 de enero a las 10:00 (24h antes de la salida)

### 1.3 Expiración Automática

**Condiciones:**
- La reserva no fue pagada dentro de la ventana de tiempo establecida
- Sistema automáticamente cambia el estado a `EXPIRED`

**Consecuencias:**
- ❌ **Pasajero**: Pierde el lugar reservado
- ✅ **Asientos**: Se liberan automáticamente para otros pasajeros
- 🔔 **Notificaciones**: Se envía notificación al pasajero y conductor
- ♻️ **Re-reserva**: El pasajero puede volver a solicitar si hay lugares disponibles

---

## 2. Proceso de Transferencia Bancaria

### 2.1 Información de Cuenta Bancaria

**Datos bancarios oficiales de Tengo Lugar:**

```
Razón Social: Tengo Lugar S.A.
CUIT/CUIL: [A COMPLETAR]
Banco: [A COMPLETAR]
Tipo de cuenta: Cuenta Corriente
CBU: [A COMPLETAR]
Alias: tengo.lugar.pagos
```

**IMPORTANTE**: Esta información debe mostrarse al pasajero inmediatamente después de la aprobación.

### 2.2 Envío de Comprobante vía WhatsApp

**Proceso obligatorio:**

1. **Realizar la transferencia** desde una cuenta bancaria
2. **Capturar el comprobante** (screenshot o PDF del banco)
3. **Enviar al WhatsApp de Tengo Lugar**: [NÚMERO A COMPLETAR]
4. **Incluir en el mensaje**:
   - Número de reserva (ID del `TripPassenger`)
   - Nombre completo del pasajero
   - Origen → Destino del viaje
   - Fecha del viaje

**Formato del mensaje de WhatsApp:**
```
Hola! Adjunto comprobante de pago

Reserva: [ID]
Nombre: [Nombre del pasajero]
Viaje: [Origen] → [Destino]
Fecha: [DD/MM/YYYY]
Monto: $[Total]
```

### 2.3 Requisitos del Comprobante

**Formatos aceptados:**
- ✅ Imagen (JPG, PNG)
- ✅ PDF del banco
- ❌ NO se aceptan capturas editadas o modificadas

**Información visible requerida:**
- Nombre del titular de la cuenta origen
- Fecha y hora de la transferencia
- Monto transferido (debe coincidir con el total)
- Banco origen y destino
- Número de operación/transacción
- CBU/CVU de destino (debe coincidir con cuenta de Tengo Lugar)

### 2.4 Verificación del Número de WhatsApp

**Requisito crítico:**
- El comprobante **DEBE** enviarse desde el **número de teléfono registrado** del pasajero
- El número debe estar verificado en la plataforma
- Sistema valida que `User.phoneNumber` coincida con el remitente de WhatsApp

**Validaciones:**
```typescript
- User.phoneNumberVerified === true
- WhatsApp remitente === User.phoneNumber
- Si no coincide → Rechazo automático
```

---

## 3. Cálculo de Montos

### 3.1 Composición del Pago

**Total a pagar = Precio del viaje + Tarifa de servicio**

```
Precio del viaje (TripPassenger.totalPrice)
    = Trip.price × TripPassenger.seatsReserved

Tarifa de servicio (serviceFee)
    = Según FeePolicy del viaje
    - Puede ser porcentaje (%)
    - Puede ser monto fijo
    - Puede ser por asiento

Total del pago (Payment.amount)
    = Precio del viaje + Tarifa de servicio
```

### 3.2 Ejemplos de Cálculo

**Ejemplo 1 - Fee por porcentaje (10%):**
```
Precio del viaje: $5,000 (1 asiento × $5,000)
Tarifa de servicio: $500 (10% de $5,000)
-----------------------------------------
TOTAL A TRANSFERIR: $5,500
```

**Ejemplo 2 - Fee fijo:**
```
Precio del viaje: $3,000 (2 asientos × $1,500)
Tarifa de servicio: $300 (fee fijo)
-----------------------------------------
TOTAL A TRANSFERIR: $3,300
```

**Ejemplo 3 - Fee por asiento:**
```
Precio del viaje: $8,000 (2 asientos × $4,000)
Tarifa de servicio: $400 ($200 por asiento × 2)
-----------------------------------------
TOTAL A TRANSFERIR: $8,400
```

### 3.3 Desglose Mostrado al Usuario

**Pantalla de confirmación de pago:**
```
╔════════════════════════════════════╗
║  RESUMEN DE PAGO                   ║
╠════════════════════════════════════╣
║  Precio del viaje:        $5,000   ║
║  Asientos reservados:          1   ║
║  Subtotal:                $5,000   ║
║  ────────────────────────────────  ║
║  Tarifa de servicio:        $500   ║
║  ────────────────────────────────  ║
║  TOTAL A PAGAR:           $5,500   ║
╚════════════════════════════════════╝
```

---

## 4. Verificación de Pagos

### 4.1 Proceso de Verificación Manual

**Flujo administrativo:**

1. **Recepción**: Admin recibe comprobante vía WhatsApp
2. **Validación inicial**:
   - ✅ Número de WhatsApp coincide con pasajero
   - ✅ Formato de comprobante válido
   - ✅ Información requerida presente
3. **Verificación bancaria**:
   - ✅ Monto correcto
   - ✅ CBU destino correcto
   - ✅ Transferencia efectivamente acreditada
4. **Registro en sistema**:
   - Cargar comprobante a S3
   - Actualizar `BankTransfer` con datos
   - Cambiar estado de pago
5. **Confirmación**:
   - `Payment.status` → `COMPLETED`
   - `TripPassenger.reservationStatus` → `CONFIRMED`
   - Notificar pasajero y conductor

### 4.2 Estados de Verificación

**Estados del Payment:**

| Estado | Descripción | Acción Admin |
|--------|-------------|--------------|
| `PENDING` | Esperando comprobante | Esperar envío |
| `PROCESSING` | Comprobante recibido, en verificación | Verificar datos |
| `COMPLETED` | Pago verificado y confirmado | Ninguna |
| `FAILED` | Pago rechazado | Notificar motivo |

**Estados implícitos del BankTransfer:**

```typescript
// Comprobante no enviado
BankTransfer === null && Payment.status === 'PENDING'

// Comprobante enviado pero no verificado
BankTransfer !== null && BankTransfer.verifiedAt === null

// Comprobante verificado
BankTransfer !== null && BankTransfer.verifiedAt !== null
```

### 4.3 Tiempo de Procesamiento

**SLA de verificación:**
- **Horario hábil** (Lun-Vie 9:00-18:00): Máximo 4 horas
- **Fuera de horario**: Máximo 24 horas
- **Fines de semana**: Máximo 48 horas

**Notificaciones automáticas:**
- ✉️ Al recibir comprobante: "Recibimos tu comprobante, lo estamos verificando"
- ✅ Al aprobar: "¡Pago confirmado! Tu reserva está garantizada"
- ❌ Al rechazar: "Comprobante rechazado: [motivo]. Por favor, envía uno válido"

### 4.4 Registro en Base de Datos

**Campos a completar al verificar:**

```typescript
BankTransfer {
  proofFileKey: "s3-key-del-comprobante.jpg",
  transferDate: DateTime, // Fecha de la transferencia según comprobante
  accountOwner: "Juan Pérez", // Titular de cuenta origen
  verifiedAt: DateTime.now(),
  verifiedBy: adminUserId,
  failureReason: null // Solo si es rechazado
}

Payment {
  status: "COMPLETED",
  completedAt: DateTime.now()
}

TripPassenger {
  reservationStatus: "CONFIRMED"
}
```

---

## 5. Manejo de Errores y Rechazos

### 5.1 Motivos de Rechazo de Comprobante

**Errores comunes:**

| Motivo | Código | Descripción | Solución |
|--------|--------|-------------|----------|
| Monto incorrecto | `AMOUNT_MISMATCH` | El monto no coincide con el total | Transferir diferencia o solicitar reembolso |
| CBU incorrecto | `INVALID_CBU` | Transferido a CBU equivocado | Realizar nueva transferencia |
| Comprobante ilegible | `UNREADABLE_PROOF` | No se puede leer la información | Enviar imagen más clara |
| Comprobante editado | `TAMPERED_PROOF` | Detectada edición del comprobante | Enviar comprobante original |
| Número incorrecto | `PHONE_MISMATCH` | WhatsApp no coincide con registro | Enviar desde número registrado |
| Transferencia no encontrada | `TRANSFER_NOT_FOUND` | No se acreditó en cuenta | Esperar acreditación o contactar banco |

### 5.2 Proceso de Corrección

**Si el comprobante es rechazado:**

1. **Notificación inmediata** al pasajero vía:
   - WhatsApp
   - Notificación push
   - Email
2. **Explicación clara** del motivo de rechazo
3. **Instrucciones** para corregir el error
4. **Nueva ventana de tiempo**:
   - Si es monto incorrecto: 24 horas para completar
   - Si es comprobante: 6 horas para reenviar
   - Si es transferencia no acreditada: 48 horas para confirmar

**Ejemplo de mensaje de rechazo:**
```
❌ Comprobante rechazado

Motivo: Monto incorrecto
Monto enviado: $5,000
Monto requerido: $5,500
Diferencia: $500

Por favor, transferí los $500 restantes y
enviá el nuevo comprobante dentro de las
próximas 24 horas.

Gracias!
```

### 5.3 Casos Especiales

**Transferencia excedente:**
- Si el pasajero transfiere de más: Retener como crédito para futuros viajes
- Notificar el saldo a favor

**Transferencia insuficiente:**
- Retener como pago parcial
- Solicitar diferencia dentro de 24 horas
- Si no completa: Reembolsar automáticamente

**Transferencia duplicada:**
- Verificar en sistema
- Si ya estaba confirmado: Reembolsar segunda transferencia
- Notificar inmediatamente

---

## 6. Integración con Sistema de Cancelaciones

### 6.1 Políticas Aplicables Solo a Pagos Confirmados

**Regla fundamental:**
- Las políticas de cancelación con reembolso **SOLO aplican a reservas `CONFIRMED`**
- Reservas en estado `APPROVED` (no pagadas) no tienen derecho a reembolso

**Estados y reembolsos:**

| Estado | Puede cancelar | Reembolso aplicable | Referencia |
|--------|----------------|---------------------|------------|
| `PENDING_APPROVAL` | ✅ Sí | ❌ No (no pagó) | - |
| `APPROVED` | ✅ Sí | ❌ No (no pagó) | - |
| `CONFIRMED` | ✅ Sí | ✅ Sí (según tiempo) | Ver doc CANCELACIONES.md |
| `EXPIRED` | ❌ No | ❌ No | - |

### 6.2 Expiración vs Cancelación

**Diferencias clave:**

**Expiración (APPROVED → EXPIRED):**
- Sistema automático por no pagar
- NO hay reembolso (nunca hubo pago)
- Asientos se liberan automáticamente
- Sin penalidad para el pasajero

**Cancelación (APPROVED → CANCELLED):**
- Acción manual del pasajero antes de pagar
- NO hay reembolso (nunca hubo pago)
- Asientos se liberan inmediatamente
- Sin penalidad para el pasajero

**Cancelación con pago (CONFIRMED → CANCELLED_*):**
- Acción manual del pasajero después de pagar
- **SÍ hay reembolso** según políticas de tiempo
- Aplica retención de tarifa de servicio
- Ver documento `REGLAS_DE_NEGOCIO_CANCELACIONES.md`

### 6.3 Tabla Resumen de Transiciones

```
╔═══════════════════╦══════════════════════╦═══════════════════╗
║ Estado Origen     ║ Acción               ║ Estado Destino    ║
╠═══════════════════╬══════════════════════╬═══════════════════╣
║ APPROVED          ║ Pagar                ║ CONFIRMED         ║
║ APPROVED          ║ No pagar (timeout)   ║ EXPIRED           ║
║ APPROVED          ║ Cancelar manual      ║ CANCELLED (sin $) ║
║ CONFIRMED         ║ Cancelar >24h        ║ CANCELLED_EARLY   ║
║ CONFIRMED         ║ Cancelar 12-24h      ║ CANCELLED_MEDIUM  ║
║ CONFIRMED         ║ Cancelar <12h        ║ CANCELLED_LATE    ║
║ CONFIRMED         ║ No show              ║ NO_SHOW           ║
║ CONFIRMED         ║ Completar viaje      ║ COMPLETED         ║
╚═══════════════════╩══════════════════════╩═══════════════════╝
```

---

## 7. Modelo de Base de Datos

### 7.1 Estructura de Payment

```prisma
model Payment {
  id              String        @id @default(uuid())
  tripPassengerId String        @unique
  amount          Float         // Total = precio viaje + service fee
  currency        String        @default("ARS")
  status          PaymentStatus @default(PENDING)
  notes           String?       // Notas del admin sobre el pago
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  completedAt     DateTime?     // Cuándo se verificó el pago

  tripPassenger TripPassenger @relation(fields: [tripPassengerId], references: [id])
  bankTransfer  BankTransfer?
  refund        Refund?

  @@index([status])
  @@index([createdAt])
}

enum PaymentStatus {
  PENDING     // Esperando comprobante
  PROCESSING  // Comprobante recibido, verificando
  COMPLETED   // Verificado y confirmado
  FAILED      // Rechazado
  REFUNDED    // Reembolsado (post-cancelación)
}
```

### 7.2 Estructura de BankTransfer

```prisma
model BankTransfer {
  id            String    @id @default(uuid())
  paymentId     String    @unique
  accountOwner  String?   // Titular de cuenta origen (del comprobante)
  transferDate  DateTime? // Fecha de la transferencia (del comprobante)
  proofFileKey  String?   // S3 key del comprobante
  verifiedAt    DateTime? // Cuándo el admin verificó
  verifiedBy    String?   // ID del admin que verificó
  failureReason String?   // Si fue rechazado, motivo

  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)
}
```

### 7.3 Relaciones

```
TripPassenger (1) ←→ (1) Payment
Payment (1) ←→ (0..1) BankTransfer
Payment (1) ←→ (0..1) Refund

// Un TripPassenger tiene exactamente un Payment
// Un Payment puede tener 0 o 1 BankTransfer (si se envió comprobante)
// Un Payment puede tener 0 o 1 Refund (si se canceló después de pagar)
```

### 7.4 Flujo de Creación de Registros

**Paso 1: Aprobación de pasajero**
```typescript
// Cuando se aprueba un pasajero (PENDING_APPROVAL → APPROVED)
const payment = await prisma.payment.create({
  data: {
    tripPassengerId: tripPassenger.id,
    amount: calculateTotalAmount(tripPassenger, trip),
    currency: "ARS",
    status: "PENDING"
  }
});

// BankTransfer se crea cuando admin carga el comprobante
```

**Paso 2: Admin recibe comprobante vía WhatsApp**
```typescript
// Admin carga comprobante al sistema
const bankTransfer = await prisma.bankTransfer.create({
  data: {
    paymentId: payment.id,
    proofFileKey: s3Key,
    transferDate: dateFromProof,
    accountOwner: ownerFromProof
  }
});

await prisma.payment.update({
  where: { id: payment.id },
  data: { status: "PROCESSING" }
});
```

**Paso 3: Verificación exitosa**
```typescript
await prisma.$transaction([
  // Actualizar BankTransfer
  prisma.bankTransfer.update({
    where: { id: bankTransfer.id },
    data: {
      verifiedAt: new Date(),
      verifiedBy: adminId
    }
  }),

  // Actualizar Payment
  prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date()
    }
  }),

  // Actualizar TripPassenger
  prisma.tripPassenger.update({
    where: { id: tripPassenger.id },
    data: {
      reservationStatus: "CONFIRMED"
    }
  })
]);
```

---

## 8. Notificaciones del Sistema

### 8.1 Notificaciones al Pasajero

**Momento 1 - Aprobación recibida:**
```
✅ ¡Tu reserva fue aprobada!

Ahora debés realizar el pago para confirmar tu lugar.

Total a pagar: $5,500
Tenés 48 horas para pagar.

[Ver datos bancarios]
[Cómo pagar]
```

**Momento 2 - Recordatorio (24h antes de expirar):**
```
⏰ Recordatorio de pago

Tu reserva expira en 24 horas.
Total: $5,500

Transferí y enviá el comprobante por WhatsApp
a: [NÚMERO]

[Ver datos bancarios]
```

**Momento 3 - Comprobante recibido:**
```
📄 Comprobante recibido

Estamos verificando tu pago.
Te notificaremos cuando esté confirmado.

Tiempo estimado: 4 horas hábiles
```

**Momento 4 - Pago confirmado:**
```
🎉 ¡Pago confirmado!

Tu reserva está garantizada.
Ya podés ver los detalles del viaje.

[Ver mi viaje]
[Chat con el conductor]
```

**Momento 5 - Pago rechazado:**
```
❌ Comprobante rechazado

Motivo: [RAZÓN]

[Detalles]
[Reenviar comprobante]
```

**Momento 6 - Reserva expirada:**
```
⏱️ Reserva expirada

Tu reserva expiró por falta de pago.
Podés volver a reservar si hay lugares disponibles.

[Buscar viajes]
```

### 8.2 Notificaciones al Conductor

**Momento 1 - Pasajero aprobado:**
```
✅ Pasajero aprobado

Esperando confirmación de pago.
Te notificaremos cuando pague.

Reserva: [Nombre] - [Origen → Destino]
```

**Momento 2 - Pago confirmado:**
```
💰 Pago confirmado

El pasajero [Nombre] confirmó su pago.
Reserva garantizada.

[Ver pasajeros confirmados]
```

**Momento 3 - Reserva expirada:**
```
⏱️ Reserva expirada

La reserva de [Nombre] expiró por falta de pago.
Los asientos volvieron a estar disponibles.

Asientos liberados: [N]
```

### 8.3 Notificaciones al Admin

**Panel de verificación:**
```
📋 Comprobantes pendientes de verificación

- Reserva #123: Juan Pérez - $5,500 (hace 1h)
- Reserva #124: María González - $3,300 (hace 3h)
- Reserva #125: Carlos López - $8,400 (hace 5h)

[Verificar pagos]
```

---

## 9. Consideraciones de Seguridad

### 9.1 Validaciones Críticas

**Antes de cambiar a CONFIRMED:**

```typescript
✅ Payment.status === 'COMPLETED'
✅ Payment.amount === TripPassenger.totalPrice + serviceFee
✅ BankTransfer.verifiedAt !== null
✅ BankTransfer.verifiedBy !== null
✅ Trip.status === 'PENDING' || 'ACTIVE'
✅ Trip.remainingSeats >= TripPassenger.seatsReserved
```

### 9.2 Prevención de Fraudes

**Medidas implementadas:**

1. **Verificación de número de teléfono**:
   - WhatsApp debe coincidir con `User.phoneNumber`
   - Número debe estar verificado previamente

2. **Verificación manual obligatoria**:
   - Admin humano revisa cada comprobante
   - No se acepta automatización para pagos

3. **Doble validación de montos**:
   - Monto en comprobante vs monto calculado
   - Tolerancia cero en diferencias

4. **Registro de auditoría**:
   - Quién verificó el pago
   - Cuándo se verificó
   - Cambios de estado registrados

5. **Comprobantes inmutables**:
   - Una vez cargado, no se puede editar
   - Cualquier corrección requiere nuevo comprobante

### 9.3 Protección de Datos Bancarios

**Manejo de información sensible:**

- ❌ NO almacenar datos bancarios del pasajero
- ✅ Solo almacenar nombre del titular (para validación)
- ✅ Comprobantes en S3 con acceso restringido
- ✅ URLs pre-firmadas con expiración corta
- ✅ Acceso solo para admins autorizados

---

## 10. Métricas y KPIs

### 10.1 Métricas de Conversión

**Seguimiento de funnel:**

```
100% - Reservas aprobadas (APPROVED)
  ↓
 85% - Comprobantes enviados
  ↓
 80% - Pagos verificados exitosamente (CONFIRMED)
  ↓
 15% - Reservas expiradas sin pagar
  ↓
  5% - Comprobantes rechazados
```

### 10.2 Indicadores de Salud del Sistema

**KPIs a monitorear:**

| Métrica | Target | Crítico si |
|---------|--------|------------|
| Tiempo medio de verificación | < 4h | > 24h |
| Tasa de aprobación de comprobantes | > 90% | < 70% |
| Tasa de conversión APPROVED→CONFIRMED | > 80% | < 60% |
| Reservas expiradas | < 15% | > 30% |
| Pagos pendientes de verificación | < 10 | > 50 |

### 10.3 Reportes Recomendados

**Dashboard diario:**
- Pagos pendientes de verificación
- Reservas próximas a expirar (< 6h)
- Comprobantes rechazados hoy
- Conversión APPROVED → CONFIRMED

**Dashboard mensual:**
- Total recaudado
- Promedio de tiempo de verificación
- Motivos de rechazo más comunes
- Tendencia de conversión

---

## 11. Casos de Uso Completos

### Caso 1: Flujo Exitoso Normal

**Situación**: Juan reserva un viaje con aprobación automática y paga correctamente.

**Timeline:**
```
Día 1 - 10:00
- Juan hace reserva → PENDING_APPROVAL
- Viaje tiene autoApproveReservations = true
- Sistema aprueba automáticamente → APPROVED
- Payment creado con status = PENDING
- Juan recibe notificación con datos bancarios

Día 1 - 11:30
- Juan realiza transferencia de $5,500
- Juan envía comprobante por WhatsApp desde su número registrado

Día 1 - 14:00
- Admin recibe y revisa comprobante
- Verifica: monto correcto, CBU correcto, comprobante legible
- BankTransfer creado con comprobante
- Payment.status → PROCESSING

Día 1 - 14:05
- Admin confirma verificación
- BankTransfer.verifiedAt = now
- Payment.status → COMPLETED
- TripPassenger.reservationStatus → CONFIRMED
- Juan recibe notificación: "¡Pago confirmado!"
- Conductor recibe notificación: "Pasajero confirmado"

Resultado: ✅ Reserva confirmada exitosamente
```

### Caso 2: Comprobante Rechazado - Monto Incorrecto

**Situación**: María transfiere un monto menor al requerido.

**Timeline:**
```
Día 1 - 09:00
- María reserva, conductor aprueba → APPROVED
- Total requerido: $5,500
- Payment creado

Día 1 - 10:00
- María transfiere solo $5,000 (olvidó la tarifa de servicio)
- María envía comprobante por WhatsApp

Día 1 - 12:00
- Admin revisa comprobante
- Detecta: monto incorrecto ($5,000 vs $5,500)
- Payment.status → FAILED
- BankTransfer.failureReason = "AMOUNT_MISMATCH: Faltan $500"
- María recibe notificación detallada

Día 1 - 13:00
- María transfiere los $500 faltantes
- María envía nuevo comprobante

Día 1 - 15:00
- Admin verifica segundo comprobante
- Suma total: $5,000 + $500 = $5,500 ✅
- Payment.status → COMPLETED
- TripPassenger → CONFIRMED

Resultado: ✅ Reserva confirmada después de corrección
```

### Caso 3: Expiración por No Pago

**Situación**: Carlos no paga dentro del plazo establecido.

**Timeline:**
```
Lunes 10:00
- Carlos reserva, conductor aprueba → APPROVED
- Plazo límite: Miércoles 10:00 (48 horas)
- Payment creado

Martes 10:00
- Sistema envía recordatorio (24h restantes)
- Carlos no responde

Miércoles 09:00
- Sistema envía última notificación (1h restante)
- Carlos no responde

Miércoles 10:00
- Sistema automático ejecuta:
  - TripPassenger.reservationStatus → EXPIRED
  - Payment.status → FAILED
  - Payment.notes = "Expiró por falta de pago"
  - Trip.remainingSeats += Carlos.seatsReserved
  - Carlos recibe notificación: "Reserva expirada"
  - Conductor recibe notificación: "Asientos liberados"

Resultado: ❌ Reserva expirada, asientos liberados
```

### Caso 4: WhatsApp desde Número Incorrecto

**Situación**: Ana envía comprobante desde un WhatsApp que no coincide con su registro.

**Timeline:**
```
Día 1 - 10:00
- Ana reserva y es aprobada → APPROVED
- Ana.phoneNumber = "+5491123456789"

Día 1 - 11:00
- Ana realiza transferencia correcta
- Ana envía comprobante desde WhatsApp: "+5491198765432" ❌
  (número diferente al registrado)

Día 1 - 13:00
- Admin recibe comprobante
- Sistema valida: número no coincide con registro
- Admin rechaza automáticamente
- BankTransfer.failureReason = "PHONE_MISMATCH"
- Ana recibe notificación:
  "Comprobante debe enviarse desde +5491123456789"

Día 1 - 14:00
- Ana reenvía desde su número registrado ✅
- Admin verifica y aprueba
- Reserva confirmada

Resultado: ✅ Confirmado después de corrección
```

---

## 12. Preguntas Frecuentes (FAQ)

### Para Pasajeros

**P: ¿Cuánto tiempo tengo para pagar?**
R: 48 horas desde la aprobación, o hasta 24 horas antes de la salida si el viaje es cercano.

**P: ¿Qué pasa si me equivoco en el monto?**
R: Enviá la diferencia y el nuevo comprobante. El admin verificará ambos.

**P: ¿Puedo pagar en efectivo?**
R: No, solo aceptamos transferencia bancaria con comprobante.

**P: ¿Por qué debo enviar el comprobante por WhatsApp?**
R: Para validar que el pago proviene de tu número de teléfono registrado.

**P: ¿Cuánto tardan en verificar mi pago?**
R: En horario hábil, máximo 4 horas. Fuera de horario, hasta 24 horas.

**P: Mi reserva expiró, ¿puedo recuperarla?**
R: No automáticamente. Deberás hacer una nueva reserva si hay lugares disponibles.

### Para Conductores

**P: ¿Cuándo recibo el dinero del viaje?**
R: Después de completar el viaje exitosamente, según nuestro proceso de pagos a conductores.

**P: ¿Qué pasa si un pasajero no paga?**
R: La reserva expira automáticamente y los asientos quedan disponibles.

**P: ¿Puedo rechazar a un pasajero que ya pagó?**
R: No, una vez confirmado el pago, el lugar está garantizado. Solo soporte puede cancelar con justificación válida.

### Para Admins

**P: ¿Qué hago si el comprobante es ilegible?**
R: Rechazar con motivo "UNREADABLE_PROOF" y solicitar uno más claro.

**P: ¿Cómo verifico que la transferencia se acreditó?**
R: Revisar el extracto bancario de la cuenta de Tengo Lugar.

**P: ¿Qué hago con transferencias duplicadas?**
R: Verificar en sistema si ya estaba confirmado. Si sí, procesar reembolso de la segunda transferencia.

---

## 13. Roadmap Futuro

### Fase 2: Mejoras al Sistema Actual

- [ ] Integración con API bancaria para validación automática
- [ ] OCR para extraer datos del comprobante automáticamente
- [ ] Dashboard de verificación con filtros y búsqueda
- [ ] Reportes automáticos de pagos pendientes
- [ ] Sistema de alertas para admins (pagos urgentes)

### Fase 3: Métodos de Pago Adicionales

- [ ] Mercado Pago
- [ ] Modo/Naranja X
- [ ] Tarjetas de crédito/débito
- [ ] Billeteras virtuales (Ualá, Brubank, etc.)
- [ ] QR de pago

### Fase 4: Automatización

- [ ] Verificación automática con webhook bancario
- [ ] IA para validar comprobantes
- [ ] Sistema de scoring para aprobar pagos automáticamente
- [ ] Integración con sistemas antifraude

---

**Documento creado:** [FECHA]
**Última actualización:** [FECHA]
**Versión:** 1.0
**Mantenido por:** Equipo de Producto - Tengo Lugar
