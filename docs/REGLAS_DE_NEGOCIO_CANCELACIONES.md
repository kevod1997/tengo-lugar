# Reglas de Negocio para Cancelaciones - Tengo Lugar

**Basado en el modelo de BlaBlaCar para plataformas de carpooling/viajes compartidos**

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
- ✅ **Pasajero**: Recibe reembolso completo (incluyendo tarifa de servicio)
- ❌ **Conductor**: NO recibe compensación alguna
- ✅ **Conductor**: Sin penalidades en rating o advertencias
- 📊 **Estado**: Reserva pasa a `CANCELLED_BY_DRIVER_EARLY`
- 💰 **Reembolso**: `FULL_REFUND` (incluyendo service fee)

**Ejemplo:**
- Precio del viaje: $5,000
- Tarifa de servicio: $500
- Total pagado: $5,500
- **Reembolso al pasajero: $5,500 (completo con service fee)**
- **Retiene Tengo Lugar: $0**

### 2.3 Modificación de Viaje - Entre 48h y 36h

**Condiciones:**
- El conductor modifica horario, ruta o preferencias del viaje
- La modificación se realiza entre 48 y 36 horas antes de la salida
- Tiene pasajeros en estado `CONFIRMED` (pagado)

**Consecuencias:**
- ✅ **Conductor**: Puede realizar cambios sin penalidades
- 🔔 **Pasajeros**: Notificación automática de cambios
- ⏰ **Pasajeros**: Tienen 12 horas para decidir si mantienen o cancelan
- 📊 **Estado**: Si pasajero cancela por cambios → `CANCELLED_BY_DRIVER_CHANGES`
- 💰 **Reembolso pasajero**: `FULL_REFUND` (incluyendo service fee)

**Tipos de cambios permitidos:**
- Cambio de horario de salida (máximo ±2 horas)
- Cambio de punto de encuentro dentro de la misma ciudad
- Modificación de ruta (siempre que no aumente >20% la distancia)
- Cambio de preferencias del viaje (equipaje, mascotas, etc.)

### 2.4 Cancelación con Pasajeros Pagos - Menos de 36 Horas

**Condiciones:**
- El conductor cancela un viaje con pasajeros en estado `CONFIRMED`
- La cancelación se realiza menos de 36 horas antes de la salida

**Consecuencias:**
- ✅ **Pasajero**: Recibe reembolso completo (incluyendo tarifa de servicio)
- ❌ **Conductor**: NO recibe compensación alguna
- ⚠️ **Conductor**: Penalidad en rating e impacto en visibilidad
- 📊 **Estado**: Reserva pasa a `CANCELLED_BY_DRIVER_LATE`
- 💰 **Reembolso**: `FULL_REFUND` (incluyendo service fee)
- 🚫 **Penalidad**: Suspensión temporal si es reincidente

### 2.5 Gestión de Pasajeros según Estado de Pago

**Pasajeros NO Pagos (PENDING_APPROVAL, APPROVED):**
- ✅ **Conductor**: Puede rechazar o bajar del viaje libremente
- ✅ **Conductor**: Sin penalidades por estas acciones
- 📊 **Estado**: Pasa a `REJECTED` o `CANCELLED_BY_DRIVER`

**Pasajeros Pagos (CONFIRMED):**
- ❌ **Conductor**: NO puede bajar al pasajero del viaje
- 🚫 **Acción bloqueada**: Sistema no permite quitar pasajeros pagos
- 💡 **Alternativa**: Solo a través de soporte con justificación válida

### 2.6 Penalidades por Cancelaciones Frecuentes (Solo para viajes con pasajeros pagos)

**Sistema de Penalidades:**
- **1-2 cancelaciones tardías/mes**: Advertencia
- **3-4 cancelaciones tardías/mes**: Reducción temporal de visibilidad
- **5+ cancelaciones tardías/mes**: Suspensión temporal de 7 días
- **Patrón recurrente**: Suspensión permanente

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
CANCELLED_BY_DRIVER_LATE      // Cancelado por conductor <36h (con penalidad)
CANCELLED_BY_DRIVER_CHANGES   // Pasajero cancela por cambios del conductor
NO_SHOW                       // No se presentó (sin reembolso)
TRIP_MODIFIED                 // Viaje modificado por conductor (48-36h)
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
                              CANCELLED_BY_DRIVER_CHANGES

CONFIRMED → TRIP_MODIFIED → CONFIRMED (si pasajero acepta)
                         → CANCELLED_BY_DRIVER_CHANGES (si pasajero rechaza)
```

### 3.3 Diferenciación por Estado de Pago

**Estados que requieren pago previo:**
- `CANCELLED_EARLY`, `CANCELLED_MEDIUM`, `CANCELLED_LATE`
- `CANCELLED_BY_DRIVER_EARLY`, `CANCELLED_BY_DRIVER_LATE`
- `NO_SHOW`, `COMPLETED`

**Estados sin pago:**
- `PENDING_APPROVAL`, `APPROVED`, `REJECTED`

**Estados especiales:**
- `TRIP_MODIFIED`: Solo aplica a viajes con pasajeros pagos
- `CANCELLED_BY_DRIVER_CHANGES`: Resultado de modificaciones no aceptadas

---

## 4. Sistema de Pagos y Reembolsos

### 4.1 Estructura de Reembolsos

**Nuevos campos requeridos en el modelo Payment:**
- `refundStatus`: Estado del reembolso
- `refundAmount`: Monto a reembolsar
- `refundReason`: Razón del reembolso
- `cancellationTime`: Momento de la cancelación
- `driverCompensation`: Compensación al conductor (si aplica)

### 4.2 Estados de Reembolso Actualizados

```
NO_REFUND              // No-show o sin derecho a reembolso
FULL_REFUND            // >24h, cancelación conductor >48h, o cambios conductor
PARTIAL_REFUND_75      // Cancelación 12-24h (75% reembolso)
PARTIAL_REFUND_50      // Cancelación <12h (50% reembolso)
FULL_REFUND_WITH_FEE   // Cancelación conductor con service fee incluido
PROCESSING             // Reembolso en proceso
COMPLETED              // Reembolso completado
FAILED                 // Reembolso falló (requiere intervención manual)
```

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
- Reembolso = Precio del viaje + Tarifa de servicio (100% + fee)
- Compensación conductor = $0
- Retención Tengo Lugar = $0

**Cancelación por Conductor (<36h):**
- Reembolso = Precio del viaje + Tarifa de servicio (100% + fee)
- Compensación conductor = $0
- Retención Tengo Lugar = $0
- Penalidad conductor = Impacto en rating

**Modificación de Viaje (48-36h):**
- Si pasajero acepta = Sin cargos ni reembolsos
- Si pasajero cancela = Reembolso completo + tarifa de servicio

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
- Evaluación caso por caso por equipo de soporte

---
