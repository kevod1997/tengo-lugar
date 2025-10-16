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
- El conductor no puede bajar al pasajero dentro de **ventanas de tiempo específicas** desde la aprobación:
  - **Viaje >24h**: 8 horas desde aprobación
  - **Viaje 12-24h**: 4 horas desde aprobación
  - **Viaje 3-12h**: 2 horas desde aprobación
- Fuera de estas ventanas, el pasajero no está protegido y puede ser removido
- **IMPORTANTE**: Si faltan menos de 3 horas para la salida, no se pueden aprobar nuevos pasajeros
- **AUTO-EXPIRACIÓN**: Si faltan menos de 2 horas para la salida, las reservas `APPROVED` expiran automáticamente
- Ver [REGLAS_DE_NEGOCIO_CANCELACIONES.md - Sección 2.5.1 y 2.7](./REGLAS_DE_NEGOCIO_CANCELACIONES.md) para detalles completos

---

## 2. Proceso de Transferencia Bancaria

### 2.1 Información de Cuenta Bancaria

**Datos bancarios oficiales de Tengo Lugar:**

```
Razón Social: Tengo Lugar S.A.
CUIT/CUIL: [A COMPLETAR]
Banco: [A COMPLETAR]
CBU: [A COMPLETAR]
Alias: tengo.lugar.pagos
```

**IMPORTANTE**: Esta información debe mostrarse al pasajero inmediatamente después de la aprobación.

### 2.2 Envío de Comprobante vía WhatsApp

**Proceso obligatorio:**

1. **Realizar la transferencia** desde una cuenta bancaria
2. **Capturar el comprobante** (screenshot o PDF del banco)
3. **Enviar al WhatsApp de Tengo Lugar mediante Link generado**: [NÚMERO A COMPLETAR]

### 2.3 Requisitos del Comprobante

**Formatos aceptados:**
- ✅ Imagen (JPG, PNG)
- ✅ PDF del banco
- ❌ NO se aceptan capturas editadas o modificadas

**Información visible requerida:**
- Nombre del titular de la cuenta origen
- Monto transferido (debe coincidir con el total)
- Número de operación/transacción

### 2.4 Verificación del Número de WhatsApp

**Requisito crítico:**
- El comprobante **DEBE** enviarse desde el **número de teléfono registrado** del pasajero

### 2.5 Sistema de Verificación Automática (Complementario)

**Nota**: Existe un sistema complementario de verificación automática que procesa notificaciones de transferencias de Mercado Pago mediante una API externa.

**Características:**
- Recibe notificaciones de transferencias bancarias
- Aplica fuzzy matching entre nombre del remitente y nombre del pasajero
- Valida montos con tolerancia de ±$0.01
- Actualiza automáticamente estados de la tabla Payments si encuentra coincidencia

**⚠️ IMPORTANTE**: Este sistema **NO reemplaza** el envío obligatorio del comprobante vía WhatsApp. Los pasajeros **DEBEN** seguir enviando el comprobante como se especifica en la Sección 2.2. El sistema automático es únicamente un mecanismo de **agilización y respaldo**.

Ver documentación técnica completa en: `COMPLETAR`

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

### 5.1 Rechazo de Comprobante

**Si el comprobante es rechazado:**

1. **Notificación inmediata** al pasajero vía:
   - WhatsApp
   - Email
   - Notificacion
2. **Explicación clara** del motivo de rechazo
3. **Instrucciones** para corregir el error

**Ejemplo de mensaje de rechazo:**
```
❌ Comprobante rechazado

Motivo: Monto incorrecto
Monto enviado: $5,000
Monto requerido: $5,500
Diferencia: $500

Por favor, transferí los $500 restantes y
enviá el nuevo comprobante a la brevedad.

Gracias!
```

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

## 8. Consideraciones de Seguridad

### 8.1 Validaciones Críticas

**Antes de cambiar a CONFIRMED:**

```typescript
✅ Payment.status === 'COMPLETED'
✅ Payment.amount === TripPassenger.totalPrice + serviceFee
✅ BankTransfer.verifiedAt !== null
✅ BankTransfer.verifiedBy !== null
✅ Trip.status === 'PENDING' || 'ACTIVE'
✅ Trip.remainingSeats >= TripPassenger.seatsReserved
```

### 8.2 Prevención de Fraudes

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

### 8.3 Protección de Datos Bancarios

**Manejo de información sensible:**

- ❌ NO almacenar datos bancarios del pasajero
- ✅ Solo almacenar nombre del titular (para validación)
- ✅ Comprobantes en S3 con acceso restringido
- ✅ URLs pre-firmadas con expiración corta
- ✅ Acceso solo para admins autorizados

---

## 9. Restricciones Operacionales de Tiempo

### 9.1 Objetivo

Garantizar tiempo suficiente para:
- Verificación manual de pagos por parte del equipo administrativo
- Procesamiento de comprobantes bancarios
- Evitar reservas de último momento que no puedan completarse

**Horario de verificación manual disponible**: 9:00 AM - 11:00 PM

### 9.2 Regla de Bloqueo (3 Horas Antes de Salida)

**Condiciones:**
- Faltan menos de 3 horas para la hora de salida del viaje

**Restricciones aplicadas:**

| Actor | Acción Bloqueada | Estado Afectado |
|-------|------------------|-----------------|
| **Pasajeros** | Solicitar nuevas reservas | `PENDING_APPROVAL` |
| **Conductores** | Aprobar solicitudes pendientes | `PENDING_APPROVAL` → `APPROVED` |
| **Sistema** | Modificación de pasajeros | Todos |

**Mensaje mostrado a pasajeros:**
```
⏰ No se pueden realizar nuevas reservas con menos de 3 horas de anticipación.

El viaje sale en [X] horas y [Y] minutos.
Por favor, busca otro viaje o contacta al conductor directamente.
```

**Mensaje mostrado a conductores:**
```
⏰ No puedes aprobar solicitudes con menos de 3 horas de anticipación.

El viaje sale muy pronto y no hay tiempo suficiente para que el pasajero complete el pago y su verificación.
```

**Razón de negocio:**
- Tiempo mínimo para que el pasajero realice transferencia bancaria
- Tiempo para enviar comprobante vía WhatsApp
- Tiempo para verificación manual del admin
- Evitar cambios súbitos de ocupación cerca de la salida

### 9.3 Regla de Auto-Expiración (2 Horas Antes de Salida)

**Objetivo**: Limpiar automáticamente reservas no pagadas que ya no tienen tiempo viable para completarse.

**Condiciones:**
- Faltan menos de 2 horas para la hora de salida del viaje
- Sistema ejecuta revisión automática cada hora (Cron job con Inngest)

**Estados afectados:**

| Estado Actual | Estado Resultante | Razón |
|---------------|-------------------|-------|
| `PENDING_APPROVAL` | `EXPIRED` | No fue aprobado a tiempo |
| `APPROVED` | `EXPIRED` | No completó el pago a tiempo |
| `CONFIRMED` | Sin cambios | Pago ya verificado - **NUNCA EXPIRA** |

**Proceso de auto-expiración:**

1. **Identificación:**
   ```sql
   SELECT * FROM TripPassenger
   WHERE reservationStatus IN ('PENDING_APPROVAL', 'APPROVED')
   AND trip.departureTime < NOW() + INTERVAL '2 hours'
   ```

2. **Actualización en transacción:**
   ```typescript
   await prisma.$transaction([
     // 1. Actualizar estado a EXPIRED
     prisma.tripPassenger.updateMany({
       where: { id: { in: expiredIds } },
       data: { reservationStatus: 'EXPIRED' }
     }),

     // 2. Liberar asientos en el viaje
     prisma.trip.update({
       where: { id: tripId },
       data: {
         remainingSeats: { increment: totalSeatsToRelease }
       }
     })
   ]);
   ```

3. **Notificaciones enviadas:**
   - 📧 Email al pasajero explicando expiración
   - 🔔 Notificación push (si tiene app instalada)
   - 💬 WhatsApp con detalles del viaje
   - 📱 Notificación al conductor sobre asientos liberados

**Mensaje al pasajero (email/notificación):**
```
❌ Tu reserva ha expirado

Viaje: [Origen] → [Destino]
Fecha: [DD/MM/YYYY HH:mm]
Conductor: [Nombre del Conductor]

Tu reserva expiró automáticamente porque no se completó el pago
antes de las 2 horas previas a la salida del viaje.

Razones posibles:
• No enviaste el comprobante de pago
• El comprobante está aún en verificación
• El conductor no aprobó tu solicitud a tiempo

¿Realizaste el pago?
Si enviaste el comprobante, contacta a soporte de inmediato
para revisar tu caso.

Soporte: soporte@tengolugar.com
WhatsApp: [NÚMERO]
```

**Mensaje al conductor:**
```
🔓 Asientos liberados en tu viaje

Viaje: [Origen] → [Destino]
Fecha: [DD/MM/YYYY HH:mm]

Se liberaron [X] asientos por expiración automática de
reservas no pagadas.

Asientos disponibles ahora: [Y]

Nota: Estos asientos ya NO están disponibles para nuevas
reservas porque faltan menos de 3 horas para la salida.
```

### 9.4 Excepciones a la Auto-Expiración

**No expiran automáticamente:**

✅ **Reservas CONFIRMED (pagadas)**
- Pago ya verificado
- Lugar garantizado en el viaje
- Nunca expiran por tiempo

✅ **Comprobantes en verificación (Payment.status = PROCESSING)**
- Pasajero ya envió comprobante
- Está pendiente revisión del admin
- Sistema mantiene la reserva `APPROVED`
- Admin tiene visibilidad de urgencia (faltan <2h)
- Admin debe priorizar verificación o rechazar con justificación

✅ **Viaje cancelado por conductor**
- Si conductor cancela viaje completo
- Proceso de cancelación normal aplica
- No se ejecuta auto-expiración

**Caso especial - Comprobante en verificación:**

Si un pasajero envió comprobante pero está aún en revisión manual:

```typescript
// Sistema verifica antes de expirar
const hasProofInReview = await prisma.payment.findUnique({
  where: { tripPassengerId: passenger.id },
  select: {
    status: true,
    bankTransfer: { select: { proofFileKey: true } }
  }
});

if (hasProofInReview.status === 'PROCESSING' &&
    hasProofInReview.bankTransfer?.proofFileKey) {
  // NO EXPIRAR - Mantener APPROVED
  // Notificar a admin sobre urgencia
  await notifyAdminUrgentVerification(tripPassenger.id);
}
```

### 9.5 Timeline Visual Completo

**Ejemplo: Viaje sale a las 10:00 AM**

```
TIMELINE DE RESTRICCIONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                          │                    │                    │
         ZONA NORMAL      │   ZONA BLOQUEADA   │   ZONA CRÍTICA    │
                          │                    │                    │
                       07:00 AM             08:00 AM            10:00 AM
                      (3h antes)           (2h antes)          (SALIDA)
                          │                    │                    │
                          ▼                    ▼                    ▼

─────────────────────────┼────────────────────┼────────────────────┼────
                         │                    │                    │
✅ Pasajeros pueden      │ ❌ No nuevas       │ ⏰ Auto-expiración │
   solicitar reservas    │    solicitudes     │    ejecuta:        │
                         │                    │                    │
✅ Conductores pueden    │ ❌ No aprobar      │  • PENDING → EXPIRED
   aprobar solicitudes   │    solicitudes     │  • APPROVED → EXPIRED
                         │                    │                    │
✅ Pasajeros pueden      │ ✅ Pasajeros       │  📧 Notificaciones │
   enviar comprobantes   │    pueden enviar   │     enviadas       │
                         │    comprobantes    │                    │
✅ Admin puede           │ ✅ Admin puede     │  🔓 Asientos       │
   verificar pagos       │    verificar       │     liberados      │
                         │    urgente         │                    │
─────────────────────────┴────────────────────┴────────────────────┴────

Nota: Las reservas CONFIRMED (pagadas) NUNCA expiran y permanecen
activas en todas las zonas.
```

### 9.6 Implementación Técnica

**Cron Job con Inngest (Cada hora):**

```typescript
// functions/inngest/expire-unapproved-reservations.ts
export const expireUnapprovedReservations = inngest.createFunction(
  { id: "expire-unapproved-reservations" },
  { cron: "0 * * * *" }, // Cada hora en punto
  async ({ step }) => {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // 1. Buscar viajes que salen en <2h
    const trips = await step.run("find-trips", async () => {
      return await prisma.trip.findMany({
        where: {
          departureTime: {
            gte: now,
            lte: twoHoursFromNow
          },
          status: { in: ['PENDING', 'ACTIVE'] }
        },
        include: {
          passengers: {
            where: {
              reservationStatus: { in: ['PENDING_APPROVAL', 'APPROVED'] }
            }
          }
        }
      });
    });

    // 2. Expirar reservas (excepto las que tienen pago en verificación)
    // 3. Enviar notificaciones
    // 4. Registrar en logs
  }
);
```

**Validación en Server Actions:**

```typescript
// src/actions/trip/approve-passenger.ts
export async function approvePassenger(tripId: string, passengerId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  const hoursUntilDeparture =
    (trip.departureTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntilDeparture < 3) {
    throw ServerActionError.ValidationFailed(
      'approve-passenger.ts',
      'approvePassenger',
      'No se pueden aprobar pasajeros con menos de 3 horas de anticipación'
    );
  }

  // Continuar con aprobación...
}
```

### 9.7 Monitoreo y Alertas

**Dashboard de Admin:**
- Lista de pagos pendientes de verificación
- Indicador de urgencia (tiempo hasta salida)
- Priorización automática: viajes con <4h primero

**Alertas automáticas:**
- Email a admin cuando hay pagos `PROCESSING` con <3h hasta salida
- Slack/Discord notification para equipo de soporte
- Reporte diario de reservas expiradas

---

## 10. Pagos a Conductores Post-Viaje

### 10.1 Información Bancaria del Conductor

**Prerequisito para recibir pagos:**
- Los conductores **DEBEN** registrar su información bancaria antes de poder recibir pagos
- Sin información bancaria verificada, los pagos quedarán en estado `ON_HOLD`

**Datos requeridos:**

```
Alias de banco/Mercado Pago: ejemplo.alias.mp
CBU o CVU: 0000000000000000000000 (22 dígitos)
```

**IMPORTANTE: Validaciones críticas**

1. **La cuenta DEBE estar a nombre del conductor:**
   - El titular de la cuenta bancaria debe coincidir con el nombre registrado del conductor
   - Admin verifica esta información antes de aprobar

2. **Formato válido:**
   - Alias: 6-50 caracteres alfanuméricos con puntos
   - CBU/CVU: Exactamente 22 dígitos numéricos
   - Validación con algoritmo Luhn (verificación de dígito)

3. **Verificación administrativa:**
   - Admin revisa y aprueba la información bancaria
   - Solo después de aprobación el conductor puede recibir pagos
   - Si cambia la información, requiere nueva verificación

**Estados de verificación:**

| Estado | Descripción | Puede recibir pagos |
|--------|-------------|---------------------|
| No registrado | Conductor no cargó datos bancarios | ❌ No |
| Pendiente verificación | Datos cargados, esperando admin | ❌ No |
| Verificado | Admin aprobó información bancaria | ✅ Sí |
| Rechazado | Información incorrecta o inválida | ❌ No |

---

### 10.2 Cálculo del Pago al Conductor

**Fórmula básica:**

```
Total recibido = Σ Payments COMPLETED de pasajeros CONFIRMED
Tarifa de servicio = Según FeePolicy del viaje
Pago al conductor = Total recibido - Tarifa de servicio
```

**Desglose detallado:**

```typescript
// Paso 1: Sumar pagos completados
const paymentsCompleted = await prisma.payment.findMany({
  where: {
    tripPassenger: {
      tripId: trip.id,
      reservationStatus: 'CONFIRMED'
    },
    status: 'COMPLETED'
  }
});

const totalReceived = paymentsCompleted.reduce(
  (sum, payment) => sum + payment.amount,
  0
);

// Paso 2: Calcular tarifas de servicio
const serviceFee = calculateServiceFee(trip, paymentsCompleted);

// Paso 3: Calcular pago neto al conductor
const payoutAmount = totalReceived - serviceFee;
```

**Ejemplo 1 - Viaje sin cancelaciones:**

```
Configuración del viaje:
- Precio por asiento: $5,000
- Fee de servicio: 10% (porcentaje)
- 3 pasajeros confirmados

Cálculo:
Pasajero 1: $5,000 (viaje) + $500 (fee) = $5,500
Pasajero 2: $5,000 (viaje) + $500 (fee) = $5,500
Pasajero 3: $5,000 (viaje) + $500 (fee) = $5,500
─────────────────────────────────────────────────
Total recibido: $16,500
Tarifa de servicio: $1,500 ($500 × 3)
═════════════════════════════════════════════════
PAGO AL CONDUCTOR: $15,000
```

**Ejemplo 2 - Viaje con cancelación y reembolso:**

```
Configuración del viaje:
- Precio por asiento: $4,000
- Fee de servicio: $300 fijo por pasajero
- 3 pasajeros inicialmente confirmados
- 1 pasajero canceló (12h antes) → Reembolso 75%

Pagos recibidos:
Pasajero 1: $4,300 (viaje + fee) ✓ COMPLETED
Pasajero 2: $4,300 (viaje + fee) ✓ COMPLETED
Pasajero 3: $4,300 (viaje + fee) ✓ REFUNDED
─────────────────────────────────────────────────
Total recibido: $12,900 (2 pasajeros)
Refund al pasajero 3: $3,225 (75% de $4,300)
Retención por cancelación: $1,075 (25% de $4,300)

Distribución del monto retenido ($1,075):
- Fee de servicio pasajero 3: $300
- Compensación al conductor: $775

Cálculo final:
Total neto recibido: $12,900
Tarifas de servicio: $600 ($300 × 2)
Compensación por cancelación: +$775
═════════════════════════════════════════════════
PAGO AL CONDUCTOR: $13,075
```

**Ejemplo 3 - Fee por asiento:**

```
Configuración del viaje:
- Precio por asiento: $3,500
- Fee de servicio: $200 por asiento
- 4 pasajeros confirmados

Pagos recibidos:
4 pasajeros × ($3,500 + $200) = $14,800
─────────────────────────────────────────────────
Total recibido: $14,800
Tarifa de servicio: $800 ($200 × 4)
═════════════════════════════════════════════════
PAGO AL CONDUCTOR: $14,000
```

---

### 10.3 Flujo de Pago Post-Viaje

**Timeline completo del proceso:**

```
┌────────────────────────────────────────────────────────┐
│ PASO 1: Viaje Completado                              │
│ Trip.status = COMPLETED                                │
│ Trigger: Manual por conductor o automático            │
└────────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────────┐
│ PASO 2: Sistema Crea DriverPayout                     │
│ - Calcula totalEarned, serviceFee, payoutAmount       │
│ - Estado: PENDING                                      │
│ - Timestamp: createdAt                                 │
└────────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────────┐
│ PASO 3: Validación Prerequisitos                      │
│ ✓ Driver.bankInfoVerified === true                    │
│ ✓ payoutAmount > 0                                     │
│ ✓ No pagos duplicados para el mismo trip              │
└────────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────────┐
│ PASO 4: Admin Procesa Transferencia                   │
│ - Revisa información bancaria del conductor           │
│ - Realiza transferencia bancaria                      │
│ - Estado: PROCESSING                                   │
│ - processedBy: admin user ID                           │
│ - processedAt: timestamp                               │
└────────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────────┐
│ PASO 5: Admin Carga Comprobante                       │
│ - Sube comprobante de transferencia a S3              │
│ - Crea TransferProof con datos:                       │
│   • proofFileKey (S3 key)                              │
│   • transferDate (fecha de transferencia)             │
│   • transferredBy (admin ID)                           │
│   • notes (opcional)                                   │
└────────────────────────────────────────────────────────┘
                      ↓
┌────────────────────────────────────────────────────────┐
│ PASO 6: Pago Completado                               │
│ - Estado: COMPLETED                                    │
│ - completedAt: timestamp                               │
│ - Notificaciones enviadas al conductor                │
└────────────────────────────────────────────────────────┘
```

**Notificaciones enviadas al conductor:**

1. **Al crear DriverPayout (PENDING):**
```
✅ ¡Viaje completado!

Tu viaje [Origen] → [Destino] se ha completado exitosamente.

Detalles del pago:
💰 Total ganado: $15,000
📅 Pago procesado en: 48-72 horas

Estado: Pendiente de procesamiento
```

2. **Al procesar transferencia (PROCESSING):**
```
⏳ Pago en proceso

Estamos procesando tu pago de $15,000.

Detalles del viaje:
🚗 [Origen] → [Destino]
📅 Fecha: [DD/MM/YYYY]

El dinero llegará a tu cuenta en las próximas horas.
```

3. **Al completar pago (COMPLETED):**
```
💵 ¡Pago realizado!

Transferimos $15,000 a tu cuenta.

Detalles:
🏦 CBU/CVU: ...XXXX (últimos 4 dígitos)
📅 Fecha de transferencia: [DD/MM/YYYY HH:mm]
🚗 Viaje: [Origen] → [Destino]

Revisá tu cuenta bancaria.
¿Problemas? Contactá a soporte.
```

---

### 10.4 Estados y Timeline del Pago

**Estados del DriverPayout:**

| Estado | Descripción | Acción requerida | Tiempo típico |
|--------|-------------|------------------|---------------|
| `PENDING` | Viaje completado, pago pendiente | Admin debe procesar | 0-24h post-viaje |
| `PROCESSING` | Admin procesando transferencia | Admin debe cargar comprobante | 1-48h |
| `COMPLETED` | Transferencia completada | Ninguna | - |
| `FAILED` | Transferencia falló | Admin debe reintentar | Según fallo |
| `ON_HOLD` | En espera por verificación o disputa | Resolver bloqueo | Variable |

**Política de tiempo de pago:**

- ✅ **Objetivo**: Pagar dentro de **12-24 horas** post-viaje
- ⚠️ **Máximo aceptable**: 2 dias habiles

---

### 10.5 Manejo de Casos Especiales

#### 10.5.1 Conductor sin Información Bancaria Verificada

**Escenario:**
- Viaje completado pero conductor no tiene `Driver.bankInfoVerified = true`

**Flujo:**
1. Sistema crea DriverPayout con estado `ON_HOLD`
2. Se envía notificación al conductor:
```
⚠️ Pago retenido - Acción requerida

Tu viaje se completó pero no podemos procesarte el pago.

Motivo: Información bancaria no verificada

Acción requerida:
1. Ingresá a tu perfil
2. Completá información bancaria (Alias + CBU/CVU)
3. Esperá verificación del admin (24-48h)

Monto retenido: $15,000
```
3. Admin verifica información bancaria
4. Una vez verificado, estado cambia de `ON_HOLD` → `PENDING`
5. Flujo normal continúa

#### 10.5.2 Viaje con Disputas o Reclamos

**Escenario:**
- Pasajeros reportaron problemas con el viaje
- Hay una disputa abierta

**Flujo:**
1. Admin marca DriverPayout como `ON_HOLD`
2. Se agrega nota explicativa en `DriverPayout.notes`:
```
"Pago retenido por disputa abierta con pasajero [Nombre].
Esperando resolución. Ticket #12345"
```
3. Se notifica al conductor:
```
⏸️ Pago retenido temporalmente

Hay un reclamo relacionado con tu viaje que debe resolverse.

Detalles:
🚗 Viaje: [Origen] → [Destino]
📅 Fecha: [DD/MM/YYYY]
💰 Monto: $15,000

Un admin te contactará en breve para resolver la situación.
```
4. Una vez resuelta la disputa:
   - Si a favor del conductor: `ON_HOLD` → `PENDING` (flujo normal)
   - Si requiere ajuste de monto: Admin modifica `payoutAmount`
   - Si se cancela el pago: Estado permanece `ON_HOLD` con resolución en notas

#### 10.5.3 Transferencia Fallida

**Escenario:**
- Admin intenta transferir pero falla (CBU inválido, cuenta cerrada, etc.)

**Flujo:**
1. Admin marca estado como `FAILED`
2. Se registra motivo en `DriverPayout.notes`:
```
"Transferencia fallida: CBU inválido o cuenta cerrada.
Fecha intento: [DD/MM/YYYY HH:mm]
Error banco: [código error]"
```
3. Se notifica al conductor:
```
❌ Error en transferencia

No pudimos transferir tu pago de $15,000.

Motivo: Información bancaria inválida

Acción requerida:
1. Verificá tus datos bancarios
2. Actualizá tu CBU/CVU si es necesario
3. Esperá que admin reintente la transferencia

Si tus datos son correctos, contactá a tu banco.
```
4. Conductor actualiza información bancaria
5. Admin reintenta: `FAILED` → `PROCESSING`

#### 10.5.4 Viaje con Múltiples Cancelaciones

**Escenario:**
- 3 pasajeros confirmados
- 2 cancelaron con diferentes políticas de reembolso

**Cálculo detallado:**

```typescript
// Ejemplo:
Pasajero 1: COMPLETED → $5,500 (ingreso completo)
Pasajero 2: CANCELLED_EARLY (>24h) → $5,500 reembolsado 100%
Pasajero 3: CANCELLED_MEDIUM (12-24h) → $4,125 reembolsado (75%)

Total recibido: $5,500 + $0 + $1,375 = $6,875
Fee de servicio:
  - Pasajero 1: $500
  - Pasajero 2: $0 (reembolsado completo, incluye fee)
  - Pasajero 3: $125 (25% de $500 retenido)
Total fee: $625

Compensación conductor:
  - Por pasajero 3: $1,250 (25% de $5,000 precio viaje)

Cálculo final:
Total recibido: $6,875
Fee de servicio: -$625
Compensación: +$1,250
═══════════════════════════════════════════════
PAGO AL CONDUCTOR: $7,500
```

---

### 10.6 Seguridad y Validaciones

#### 10.7.1 Validación de CBU/CVU con Algoritmo Luhn

**Implementación del algoritmo Luhn:**

```typescript
/**
 * Valida un CBU o CVU usando el algoritmo Luhn
 * @param cbuCvu - String de 22 dígitos
 * @returns true si es válido, false si no
 */
export function validateCbuCvu(cbuCvu: string): boolean {
  // 1. Validar formato básico
  if (!/^\d{22}$/.test(cbuCvu)) {
    return false;
  }

  // 2. Separar dígitos
  const digits = cbuCvu.split('').map(Number);

  // 3. Aplicar algoritmo Luhn en los primeros 21 dígitos
  let sum = 0;
  for (let i = 0; i < 21; i++) {
    let digit = digits[i];

    // Duplicar cada segundo dígito desde la derecha
    if ((21 - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  // 4. Calcular dígito verificador
  const checkDigit = (10 - (sum % 10)) % 10;

  // 5. Comparar con el último dígito del CBU/CVU
  return checkDigit === digits[21];
}
```

**Ejemplos de validación:**

```typescript
validateCbuCvu('0000003100010000000001') // true - válido
validateCbuCvu('1234567890123456789012') // false - checksum inválido
validateCbuCvu('123456789012345678901')  // false - solo 21 dígitos
validateCbuCvu('12345678901234567890AB') // false - contiene letras
```

#### 10.7.5 Protección de Comprobantes Bancarios

**Almacenamiento seguro en S3:**

```typescript
// Subir comprobante con restricciones
const s3Key = `driver-payouts/${driverPayoutId}/transfer-proof-${Date.now()}.pdf`;

await uploadToS3({
  key: s3Key,
  body: file,
  contentType: file.type,
  metadata: {
    driverPayoutId,
    uploadedBy: adminId,
    uploadedAt: new Date().toISOString()
  }
});

// Generar URL pre-firmada con expiración corta
const presignedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  Key: s3Key,
}), {
  expiresIn: 300, // 5 minutos
});
```

**Acceso restringido:**

- ✅ Solo usuarios con role `admin` pueden ver comprobantes
- ✅ URLs pre-firmadas con expiración de 5 minutos
- ✅ Logs de acceso en S3 activados
- ✅ Encriptación en reposo (S3 server-side encryption)

#### 10.7.6 Validaciones Pre-Pago

**Checklist antes de crear DriverPayout:**

```typescript
async function validatePayoutCreation(tripId: string, driverId: string) {
  // ✓ 1. Viaje está completado
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (trip?.status !== 'COMPLETED') {
    throw new Error('El viaje debe estar completado');
  }

  // ✓ 2. Driver tiene info bancaria verificada
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: { bankInfoVerified: true, bankCbuOrCvu: true }
  });
  if (!driver?.bankInfoVerified || !driver.bankCbuOrCvu) {
    throw new Error('Conductor sin información bancaria verificada');
  }

  // ✓ 3. Existen pagos completados de pasajeros
  const completedPayments = await prisma.payment.count({
    where: {
      tripPassenger: {
        tripId,
        reservationStatus: 'CONFIRMED'
      },
      status: 'COMPLETED'
    }
  });
  if (completedPayments === 0) {
    throw new Error('No hay pagos completados de pasajeros');
  }

  // ✓ 4. No existe pago duplicado
  const existingPayout = await prisma.driverPayout.findUnique({
    where: { tripId }
  });
  if (existingPayout) {
    throw new Error('Ya existe un pago para este viaje');
  }

  // ✓ 5. Monto calculado es positivo
  const { payoutAmount } = await calculateDriverPayout(tripId);
  if (payoutAmount <= 0) {
    throw new Error('El monto a pagar debe ser positivo');
  }
}
```