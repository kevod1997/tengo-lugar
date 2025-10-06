# Reglas de Negocio para Cancelaciones - Tengo Lugar

**Basado en el modelo de BlaBlaCar para plataformas de carpooling/viajes compartidos**

---

## ⚠️ REGLA FUNDAMENTAL DEL MODELO DE NEGOCIO

**LA TARIFA DE SERVICIO (FEE) NUNCA SE DEVUELVE EN NINGÚN CASO DE CANCELACIÓN**

Esta es la base del modelo de negocio de Tengo Lugar. Independientemente de:

- Quién cancela (pasajero o conductor)
- Cuándo se cancela (anticipación)
- El motivo de la cancelación

**La tarifa de servicio siempre queda retenida por Tengo Lugar.**

Solo se reembolsa el **precio del viaje** según las reglas especificadas más abajo.

---

## 1. Políticas de Cancelación para Pasajeros

### 1.1 Cancelación con Más de 24 Horas de Anticipación

**Condiciones:**

- La cancelación se realiza más de 24 horas antes de la hora de salida programada
- El viaje debe estar en estado `CONFIRMED` (pagado)

**Consecuencias:**

- ✅ **Pasajero**: Recibe reembolso completo del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio de Tengo Lugar
- ❌ **Conductor**: NO recibe compensación alguna
- 📊 **Estado**: Reserva pasa a `CANCELLED_EARLY`
- 💰 **Reembolso**: `FULL_REFUND` (excluyendo service fee)

**Ejemplo:**

- Precio del viaje: $5,000
- Tarifa de servicio: $500
- Total pagado: $5,500
- **Reembolso al pasajero: $5,000**
- **Retiene Tengo Lugar: $500**

### 1.2 Cancelación entre 12 y 24 Horas de Anticipación

**Condiciones:**

- La cancelación se realiza entre 12 y 24 horas antes de la hora de salida
- El viaje debe estar en estado `CONFIRMED` (pagado)

**Consecuencias:**

- ✅ **Pasajero**: Recibe 75% del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio
- ✅ **Conductor**: Recibe 25% del precio del viaje como compensación
- 📊 **Estado**: Reserva pasa a `CANCELLED_MEDIUM`
- 💰 **Reembolso**: `PARTIAL_REFUND_75` (75%)

**Ejemplo:**

- Precio del viaje: $5,000
- Tarifa de servicio: $500
- Total pagado: $5,500
- **Reembolso al pasajero: $3,750**
- **Compensación al conductor: $1,250**
- **Retiene Tengo Lugar: $500**

### 1.3 Cancelación con Menos de 12 Horas de Anticipación

**Condiciones:**

- La cancelación se realiza menos de 12 horas antes de la hora de salida
- El viaje debe estar en estado `CONFIRMED` (pagado)

**Consecuencias:**

- ✅ **Pasajero**: Recibe 50% del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio
- ✅ **Conductor**: Recibe 50% del precio del viaje como compensación
- 📊 **Estado**: Reserva pasa a `CANCELLED_LATE`
- 💰 **Reembolso**: `PARTIAL_REFUND_50` (50%)

**Ejemplo:**

- Precio del viaje: $5,000
- Tarifa de servicio: $500
- Total pagado: $5,500
- **Reembolso al pasajero: $2,500**
- **Compensación al conductor: $2,500**
- **Retiene Tengo Lugar: $500**

### 1.4 Excepción de Reserva Reciente (Regla de 1 Hora)

**Condiciones:**

- El pasajero reservó el viaje dentro de las últimas 24 horas
- Cancela dentro de la 1 hora posterior a haber realizado la reserva
- Independientemente del tiempo restante hasta la salida

**Consecuencias:**

- ✅ **Pasajero**: Recibe reembolso completo del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio
- ❌ **Conductor**: NO recibe compensación
- 📊 **Estado**: Reserva pasa a `CANCELLED_EARLY`
- 💰 **Reembolso**: `FULL_REFUND` (excluyendo service fee)

### 1.5 No-Show (No Presentarse)

**Condiciones:**

- El pasajero no se presenta en el punto de encuentro
- El conductor espera el tiempo mínimo establecido (15 minutos)
- El conductor reporta la ausencia del pasajero

**Consecuencias:**

- ❌ **Pasajero**: NO recibe reembolso alguno
- ✅ **Conductor**: Recibe el pago completo del pasajero
- ✅ **Tengo Lugar**: Retiene la tarifa de servicio
- 📊 **Estado**: Reserva pasa a `NO_SHOW`
- 💰 **Reembolso**: `NO_REFUND`

---

## 2. Políticas de Cancelación y Modificaciones para Conductores

### 2.1 Cancelación sin Pasajeros Pagos

**Condiciones:**

- El conductor cancela un viaje que NO tiene pasajeros en estado `CONFIRMED` (pagado)
- Puede tener pasajeros en estado `PENDING_APPROVAL` o `APPROVED` (no pagos)

**Consecuencias:**

- ✅ **Conductor**: Sin penalidades ni advertencias
- ✅ **Pasajeros no pagos**: Notificación automática de cancelación
- 📊 **Estado**: Viaje pasa a `CANCELLED`
- 💰 **Reembolso**: No aplica (no hay pagos realizados)

### 2.2 Cancelación con Pasajeros Pagos - Más de 48 Horas

**Condiciones:**

- El conductor cancela un viaje con pasajeros en estado `CONFIRMED` (pagado)
- La cancelación se realiza más de 48 horas antes de la salida

**Consecuencias:**

- ✅ **Pasajero**: Recibe reembolso completo del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio de Tengo Lugar
- ❌ **Conductor**: NO recibe compensación alguna
- ✅ **Conductor**: Sin penalidades en rating o advertencias
- 📊 **Estado**: Reserva pasa a `CANCELLED_BY_DRIVER_EARLY`
- 💰 **Reembolso**: `FULL_REFUND` (excluyendo service fee)

**Ejemplo:**

- Precio del viaje: $5,000
- Tarifa de servicio: $500
- Total pagado: $5,500
- **Reembolso al pasajero: $5,000**
- **Retiene Tengo Lugar: $500 (tarifa de servicio)**

### 2.3 Modificación de Viaje - Hasta 36 horas antes de la salida

**Condiciones:**

- El conductor modifica horario o preferencias del viaje
- La modificación se puede realizar hasta 36 horas antes de la salida, luego de eso ya no puede
- La regla anterior solo aplica si tiene pasajeros en estado `CONFIRMED` (pagado)

**Consecuencias:**

- ✅ **Conductor**: Puede realizar cambios sin penalidades
- 🔔 **Pasajeros**: Notificación automática de cambios
- ⏰ **Pasajeros**: Siempre puede cancelar hasta 24 horas antes de la salida por lo que no afecta en nada

**Tipos de cambios permitidos:**

- Cambio de horario de salida (máximo ±6 horas)
- Cambio de preferencias del viaje (equipaje, mascotas, etc.)

### 2.4 Cancelación con Pasajeros Pagos - Menos de 48 Horas

**Condiciones:**

- El conductor cancela un viaje con pasajeros en estado `CONFIRMED`
- La cancelación se realiza menos de 48 horas antes de la salida

**Consecuencias:**

- ✅ **Pasajero**: Recibe reembolso completo del precio del viaje
- ❌ **Pasajero**: NO recibe reembolso de la tarifa de servicio de Tengo Lugar
- ❌ **Conductor**: NO recibe compensación alguna
- 📊 **Estado**: Reserva pasa a `CANCELLED_BY_DRIVER_LATE`
- 💰 **Reembolso**: `FULL_REFUND` (excluyendo service fee)
- 🚫 **Penalidad**: Suspensión temporal si es reincidente

### 2.5 Gestión de Pasajeros según Estado de Pago

**Pasajeros en Espera de Aprobación (PENDING_APPROVAL):**

- ✅ **Conductor**: Puede rechazar libremente sin restricciones
- ✅ **Conductor**: Sin penalidades por estas acciones
- 📊 **Estado**: Pasa a `REJECTED`

**Pasajeros Aprobados pero No Pagos (APPROVED):**

- ⚠️ **Conductor**: Puede bajar al pasajero SOLO dentro de ventanas de tiempo específicas (ver sección 2.5.1)
- 🔒 **Protección**: Sistema bloquea cancelación fuera de las ventanas permitidas
- 📊 **Estado**: Pasa a `CANCELLED_BY_DRIVER` si se cancela dentro de ventana válida
- 💡 **Alternativa fuera de ventana**: Solo a través de soporte con justificación válida

**Pasajeros Pagos (CONFIRMED):**

- ❌ **Conductor**: NO puede bajar al pasajero del viaje
- 🚫 **Acción bloqueada**: Sistema no permite quitar pasajeros pagos
- 💡 **Alternativa**: Solo a través de soporte con justificación válida

### 2.5.1 Ventanas de Tiempo para Rechazar Pasajeros Aprobados

**Objetivo**: Proteger a los pasajeros aprobados de cancelaciones arbitrarias del conductor, mientras se mantiene flexibilidad inicial limitada.

**Regla Fundamental**: El conductor NO puede bajar pasajeros en estado `APPROVED` durante las ventanas de tiempo de protección. Después de estas ventanas, SÍ puede removerlos del viaje.

**Ventanas de Tiempo de Protección (No puede bajar al pasajero):**

#### Escenario A: Viaje con Más de 24 Horas de Anticipación

**Condiciones:**
- Faltan más de 24 horas hasta la salida del viaje

**Ventana de Protección:**
- ❌ **Primeras 8 horas** desde que aprobó al pasajero: NO puede bajar al pasajero
- ✅ **Después de 8 horas**: SÍ puede bajar al pasajero

**Ejemplo:**
```
Viaje programado: Sábado 15:00
Conductor aprueba pasajero: Lunes 10:00
Protección: Lunes 10:00 hasta lunes 18:00 (8h) → ❌ BLOQUEADO
Después del lunes 18:00: ✅ PUEDE bajar al pasajero
```

#### Escenario B: Viaje entre 12 y 24 Horas de Anticipación

**Condiciones:**
- Faltan menos de 24 horas pero más de 12 horas hasta la salida

**Ventana de Protección:**
- ❌ **Primeras 4 horas** desde que aprobó al pasajero: NO puede bajar al pasajero
- ✅ **Después de 4 horas**: SÍ puede bajar al pasajero

**Ejemplo:**
```
Viaje programado: Sábado 10:00
Conductor aprueba pasajero: Viernes 14:00 (20h antes)
Protección: Viernes 14:00 hasta viernes 18:00 (4h) → ❌ BLOQUEADO
Después del viernes 18:00: ✅ PUEDE bajar al pasajero
```

#### Escenario C: Viaje entre 3 y 12 Horas de Anticipación

**Condiciones:**
- Faltan menos de 12 horas pero más de 3 horas hasta la salida

**Ventana de Protección:**
- ❌ **Primeras 2 horas** desde que aprobó al pasajero: NO puede bajar al pasajero
- ✅ **Después de 2 horas**: SÍ puede bajar al pasajero

**Ejemplo:**
```
Viaje programado: Sábado 10:00
Conductor aprueba pasajero: Sábado 00:00 (10h antes)
Protección: Sábado 00:00 hasta sábado 02:00 (2h) → ❌ BLOQUEADO
Después del sábado 02:00: ✅ PUEDE bajar al pasajero
```

**Nota Importante:** Si faltan menos de 3 horas para la salida, el conductor ya no puede aprobar nuevos pasajeros (ver sección 2.7).

**Lógica de Validación:**

```typescript
function canDriverRemoveApprovedPassenger(
  approvedAt: Date,
  tripDepartureTime: Date
): boolean {
  const now = new Date();
  const hoursSinceApproval = (now.getTime() - approvedAt.getTime()) / (1000 * 60 * 60);
  const hoursUntilDeparture = (tripDepartureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Si faltan menos de 3h → No se puede aprobar ni modificar (ver sección 2.7)
  if (hoursUntilDeparture < 3) return false;

  // Escenario C: Si faltan menos de 12h → NO puede bajar durante primeras 2h
  if (hoursUntilDeparture < 12) return hoursSinceApproval > 2;

  // Escenario B: Si faltan menos de 24h → NO puede bajar durante primeras 4h
  if (hoursUntilDeparture < 24) return hoursSinceApproval > 4;

  // Escenario A: Por defecto (>24h) → NO puede bajar durante primeras 8h
  return hoursSinceApproval > 8;
}
```

**Consecuencias de Intento de Cancelación Bloqueada:**

- 🚫 **Sistema**: Muestra mensaje de error indicando que la acción está bloqueada
- 📞 **Alternativa**: Conductor debe contactar soporte con justificación válida
- 📊 **Registro**: Se registra el intento en los logs del sistema
- ⚠️ **Advertencia**: Múltiples intentos pueden resultar en revisión de cuenta

**Justificaciones Válidas para Soporte:**

- Emergencia personal grave del conductor
- Problema mecánico del vehículo
- Condiciones climáticas extremas
- Otro pasajero con comportamiento inapropiado previo
- Error del sistema en la aprobación automática

**Nota Importante**: Esta protección aplica SOLO a pasajeros en estado `APPROVED` (aprobados pero no pagados). Los pasajeros en `CONFIRMED` (pagados) tienen protección total y NO pueden ser removidos bajo ninguna circunstancia excepto a través de soporte.

---

### 2.7 Restricciones de Tiempo para Gestión de Reservas

**Objetivo**: Garantizar tiempo suficiente para verificación manual de pagos y evitar problemas operacionales en los momentos previos a la salida del viaje.

#### 2.7.1 Regla de Bloqueo (3 Horas Antes de Salida)

**Condiciones:**
- Faltan menos de 3 horas para la hora de salida del viaje

**Restricciones aplicadas:**
- ❌ **Pasajeros**: NO pueden solicitar nuevas reservas
- ❌ **Conductores**: NO pueden aprobar solicitudes pendientes
- ❌ **Sistema**: Bloquea todas las acciones de modificación de pasajeros

**Mensaje mostrado:**
```
⏰ No se pueden realizar nuevas reservas con menos de 3 horas de anticipación.

El viaje sale en [X] horas y [Y] minutos. Por favor, busca otro viaje o contacta al conductor directamente.
```

**Razón de esta regla:**
- Garantizar tiempo mínimo para que pasajeros realicen el pago
- Evitar solicitudes de último momento que no tengan tiempo de procesarse
- Proteger al conductor de cambios súbitos en la ocupación del vehículo

#### 2.7.2 Regla de Auto-Expiración (2 Horas Antes de Salida)

**Condiciones:**
- Faltan menos de 2 horas para la hora de salida del viaje
- Sistema ejecuta revisión automática cada hora

**Acciones automáticas del sistema:**

1. **Identificar reservas no pagadas:**
   - Estado `PENDING_APPROVAL` (pendiente de aprobación)
   - Estado `APPROVED` (aprobado pero no pagado)

2. **Expirar reservas automáticamente:**
   - `PENDING_APPROVAL` → `EXPIRED`
   - `APPROVED` → `EXPIRED`
   - Solo permanecen: `CONFIRMED` (pagadas)

3. **Liberar asientos:**
   - `Trip.remainingSeats` += asientos de reservas expiradas
   - Asientos quedan disponibles para nuevos pasajeros (si aún no se alcanzaron las 3h)

4. **Notificaciones automáticas:**
   - 📧 Email al pasajero afectado
   - 🔔 Notificación push si tiene la app
   - 💬 WhatsApp con explicación del motivo
   - 📱 Notificación al conductor sobre liberación de asientos

**Mensaje a pasajeros afectados:**
```
❌ Tu reserva ha expirado

Viaje: [Origen] → [Destino]
Fecha: [DD/MM/YYYY HH:mm]
Conductor: [Nombre]

Tu reserva expiró automáticamente porque no se completó el pago antes de las 2 horas previas a la salida.

Razones posibles:
- No enviaste el comprobante de pago
- El comprobante está en verificación

Si realizaste el pago, contacta a soporte de inmediato.
```

**Mensaje al conductor:**
```
🔓 Asientos liberados en tu viaje

Viaje: [Origen] → [Destino]
Fecha: [DD/MM/YYYY HH:mm]

Se liberaron [X] asientos por expiración automática de reservas no pagadas.

Asientos disponibles ahora: [Y]
```

#### 2.7.3 Timeline Visual de Restricciones

**Ejemplo: Viaje programado para las 10:00 AM**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    │                    │                    │
                    │                    │                    │
                07:00 AM             08:00 AM            10:00 AM
              (3h antes)           (2h antes)          (SALIDA)
                    │                    │                    │
                    ▼                    ▼                    ▼
              ┌─────────────────────────────────────────────────┐
              │   ZONA BLOQUEADA         ZONA CRÍTICA          │
              ├─────────────────────────────────────────────────┤
              │                                                 │
              │  ❌ No nuevas solicitudes  ⏰ Auto-expiración   │
              │  ❌ No aprobar             ejecuta:             │
              │                            - PENDING → EXPIRED  │
              │                            - APPROVED → EXPIRED │
              │                            📧 Notificaciones    │
              │                            🔓 Asientos liberados│
              │                                                 │
              └─────────────────────────────────────────────────┘
```

#### 2.7.4 Excepciones y Casos Especiales

**No aplica expiración automática si:**
- ✅ Reserva está en estado `CONFIRMED` (pagada) → Nunca expira
- ✅ Comprobante está en verificación (`PROCESSING`) → Se mantiene pendiente
- ✅ Conductor cancela el viaje completo → Proceso de cancelación normal

**Pasajeros con comprobante en verificación:**
- Si el comprobante se envió pero está en proceso de verificación manual
- Sistema NO expira la reserva automáticamente
- Admin tiene visibilidad de que faltan pocas horas para la salida
- Admin debe priorizar la verificación o rechazar con justificación clara

#### 2.7.5 Implementación Técnica

**Sistema de auto-expiración:**
- Cron job con Inngest ejecutándose cada hora
- Busca viajes que salen en las próximas 2 horas
- Identifica reservas `PENDING_APPROVAL` y `APPROVED`
- Ejecuta expiración en transacción Prisma
- Envía notificaciones en segundo plano

**Validaciones en tiempo real:**
- Server Actions validan tiempo antes de aprobar
- Middleware verifica estado al acceder al viaje
- UI muestra cuenta regresiva hasta las 3h de corte

---

### 2.6 Penalidades por Cancelaciones Frecuentes (Solo para viajes con pasajeros pagos)

**Sistema de Penalidades:**

- **1 cancelaciones tardía**: Advertencia e insignia de que cancelo un viaje con anterioridad.
- **2 cancelaciones tardías**: Suspension

**Nota**: Solo se cuentan cancelaciones de viajes con pasajeros en estado `CONFIRMED`

---

## 3. Sistema de Estados de Reserva

### 3.1 Estados Actualizados

```
PENDING_APPROVAL              // Esperando aprobación del conductor
APPROVED                      // Aprobado, pendiente de pago
CONFIRMED                     // Pagado y confirmado - LISTO PARA VIAJAR
CANCELLED_EARLY               // Cancelado con >24h (reembolso completo)
CANCELLED_MEDIUM              // Cancelado 12-24h (reembolso 75%)
CANCELLED_LATE                // Cancelado <12h (reembolso 50%)
CANCELLED_BY_DRIVER_EARLY     // Cancelado por conductor >48h (sin penalidad)
CANCELLED_BY_DRIVER_LATE      // Cancelado por conductor <48h (con penalidad)
NO_SHOW                       // No se presentó (sin reembolso)
COMPLETED                     // Viaje completado exitosamente
REJECTED                      // Rechazado por conductor
```

### 3.2 Flujo de Transiciones

```
PENDING_APPROVAL → APPROVED → CONFIRMED → COMPLETED
                      ↓           ↓           ↓
                   REJECTED   CANCELLED_EARLY  NO_SHOW
                              CANCELLED_MEDIUM
                              CANCELLED_LATE
                              CANCELLED_BY_DRIVER_EARLY
                              CANCELLED_BY_DRIVER_LATE
```

### 3.3 Diferenciación por Estado de Pago

**Estados que requieren pago previo:**

- `CANCELLED_EARLY`, `CANCELLED_MEDIUM`, `CANCELLED_LATE`
- `CANCELLED_BY_DRIVER_EARLY`, `CANCELLED_BY_DRIVER_LATE`
- `NO_SHOW`, `COMPLETED`

**Estados sin pago:**

- `PENDING_APPROVAL`, `APPROVED`, `REJECTED`

---

## 4. Sistema de Pagos y Reembolsos

### 4.1 Estructura de Reembolsos y Cancelaciones

#### 4.1.1 Modelo de Base de Datos: Tabla `Refund`

Se requiere crear una tabla dedicada para registrar todos los reembolsos de forma estructurada:

```prisma
model Refund {
  id                    String          @id @default(cuid())
  paymentId             String          @unique
  payment               Payment         @relation(fields: [paymentId], references: [id])

  refundAmount          Float           // Monto reembolsado al pasajero
  driverCompensation    Float           @default(0) // Compensación al conductor
  serviceFeeRetained    Float           // Tarifa de servicio retenida por Tengo Lugar

  refundStatus          RefundStatus    // PROCESSING, COMPLETED, FAILED
  refundType            RefundType      // FULL_REFUND, PARTIAL_75, PARTIAL_50, NO_REFUND

  processedAt           DateTime?       // Cuándo se procesó el reembolso
  completedAt           DateTime?       // Cuándo se completó
  failureReason         String?         // Si falló, por qué

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}

enum RefundStatus {
  PROCESSING
  COMPLETED
  FAILED
}

enum RefundType {
  NO_REFUND
  FULL_REFUND
  PARTIAL_REFUND_75
  PARTIAL_REFUND_50
}
```

**Ventajas de esta estructura:**

- Historial completo de todos los reembolsos
- Trazabilidad de estados (procesando, completado, fallido)
- Separación clara de montos (reembolso, compensación conductor, tarifa retenida)
- Auditoría financiera completa

#### 4.1.2 Modelo de Base de Datos: Tabla `Cancellation`

Se requiere crear una tabla para registrar todas las cancelaciones con sus motivos:

```prisma
model Cancellation {
  id                    String              @id @default(cuid())

  // IMPORTANTE: Solo UNO de estos dos campos debe tener valor
  // - Si cancelledBy === PASSENGER → usar tripPassengerId
  // - Si cancelledBy === DRIVER → usar tripId
  tripPassengerId       String?             @unique
  tripPassenger         TripPassenger?      @relation(fields: [tripPassengerId], references: [id])
  tripId                String?
  trip                  Trip?               @relation(fields: [tripId], references: [id])

  cancelledBy           CancelledBy         // PASSENGER, DRIVER
  reason                String              // Texto libre - motivo de cancelación

  hoursBeforeDeparture  Float               // Horas de anticipación
  refundPercentage      Float               // % de reembolso aplicado (solo cuando cancelledBy === PASSENGER)

  cancelledAt           DateTime            @default(now())

  @@index([cancelledBy])
}

enum CancelledBy {
  PASSENGER
  DRIVER
}
```

**Reglas de Validación:**

1. **Exclusividad de relaciones:**
   - Si `cancelledBy === PASSENGER`: DEBE tener `tripPassengerId` y NO `tripId`
   - Si `cancelledBy === DRIVER`: DEBE tener `tripId` y NO `tripPassengerId`
   - Nunca deben estar ambos campos llenos simultáneamente

2. **Campo `refundPercentage`:**
   - Solo tiene valor cuando `cancelledBy === PASSENGER`
   - Cuando `cancelledBy === DRIVER`, los reembolsos se registran en la tabla `Refund` por cada pasajero afectado

3. **Escenarios de uso:**
   - **Pasajero cancela**: Afecta solo a su reserva individual (`TripPassenger`)
   - **Conductor cancela**: Afecta al viaje completo y a TODOS los pasajeros confirmados

**Ventajas de esta estructura:**

- Análisis de patrones de cancelación unificado
- Mejora continua del servicio basada en feedback real
- Identificación de problemas recurrentes
- Flexibilidad para cualquier motivo sin limitaciones de enums
- Estadísticas por actor (pasajero vs conductor)
- Trazabilidad clara de quién cancela y qué afecta

### 4.2 Estados de Reembolso Actualizados

```
NO_REFUND              // No-show o sin derecho a reembolso
FULL_REFUND            // >24h, cancelación conductor >48h, o cambios conductor (SIEMPRE excluyendo service fee)
PARTIAL_REFUND_75      // Cancelación 12-24h (75% reembolso, excluyendo service fee)
PARTIAL_REFUND_50      // Cancelación <12h (50% reembolso, excluyendo service fee)
PROCESSING             // Reembolso en proceso
COMPLETED              // Reembolso completado
FAILED                 // Reembolso falló (requiere intervención manual)
```

**IMPORTANTE**: En TODOS los casos de reembolso, la tarifa de servicio de Tengo Lugar NUNCA se devuelve. Es la base del modelo de negocio.

### 4.3 Cálculo de Montos Actualizado

**Cancelación Temprana (>24h):**

- Reembolso = Precio del viaje (100%)
- Compensación conductor = $0
- Retención Tengo Lugar = Tarifa de servicio

**Cancelación Media (12-24h):**

- Reembolso = Precio del viaje × 0.75 (75%)
- Compensación conductor = Precio del viaje × 0.25 (25%)
- Retención Tengo Lugar = Tarifa de servicio

**Cancelación Tardía (<12h):**

- Reembolso = Precio del viaje × 0.5 (50%)
- Compensación conductor = Precio del viaje × 0.5 (50%)
- Retención Tengo Lugar = Tarifa de servicio

**Cancelación por Conductor (>48h):**

- Reembolso = Precio del viaje (100%)
- Compensación conductor = $0
- Retención Tengo Lugar = Tarifa de servicio

**Cancelación por Conductor (<36h):**

- Reembolso = Precio del viaje (100%)
- Compensación conductor = $0
- Retención Tengo Lugar = Tarifa de servicio
- Penalidad conductor = Impacto en rating

**No-Show:**

- Reembolso = $0
- Compensación conductor = Precio del viaje
- Retención Tengo Lugar = Tarifa de servicio

---

## 5. Casos Especiales y Excepciones

### 5.1 Circunstancias Extraordinarias

**Eventos de Fuerza Mayor:**

**Política Especial:**

- Reembolso completo para todas las partes
- Sin penalidades para conductores o pasajeros
- Evaluación del caso por equipo de soporte

---
