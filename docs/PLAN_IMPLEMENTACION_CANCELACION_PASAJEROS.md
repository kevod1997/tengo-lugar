# Plan de Implementación: Políticas de Cancelación para Pasajeros

Voy a implementar las reglas de cancelación para pasajeros según las especificaciones del documento (puntos 1.1, 1.2, 1.3 y 1.4).

## Análisis del Estado Actual

El schema de Prisma ya tiene:
- ✅ Tabla `Refund` con estructura correcta
- ✅ Tabla `Cancellation` con campos necesarios
- ✅ Estados de `ReservationStatus` correctos
- ✅ Enums `RefundType` y `RefundStatus`

El código existente:
- ❌ `cancel-reservation.ts` no implementa lógica de reembolsos
- ❌ No calcula horas de anticipación
- ❌ No aplica políticas de cancelación según tiempo
- ❌ No crea registros de `Refund` y `Cancellation`

## Cambios Necesarios

### 1. Crear Schema de Validación (`src/schemas/validation/cancellation-schema.ts`)
- Schema para cancelación de pasajero con motivo
- Validación de campos requeridos

### 2. Crear Servicio de Cálculo de Reembolsos (`src/services/refund/refund-calculation-service.ts`)
- Función para calcular horas antes de salida
- Función para determinar tipo de reembolso según reglas:
  - **>24h**: `FULL_REFUND` (100% precio viaje, 0% conductor, 100% fee retenido)
  - **12-24h**: `PARTIAL_REFUND_75` (75% pasajero, 25% conductor, 100% fee retenido)
  - **<12h**: `PARTIAL_REFUND_50` (50% pasajero, 50% conductor, 100% fee retenido)
  - **Excepción 1h**: Si reservó hace <24h y cancela en 1h → `FULL_REFUND`
- Función para calcular montos específicos

### 3. Actualizar Server Action (`src/actions/trip/cancel-reservation.ts`)
- Agregar parámetro `reason` (motivo de cancelación)
- Validar con Zod schema
- Verificar que reserva esté en estado `CONFIRMED` (pagado)
- Calcular horas de anticipación
- Aplicar regla de excepción de 1 hora
- Determinar tipo de reembolso
- Crear transacción Prisma que:
  1. Actualice estado de `TripPassenger` según tiempo
  2. Cree registro en `Cancellation`
  3. Cree registro en `Refund` con montos calculados
  4. Cree registro en `Payment` con estado `REFUNDED` si aplica
  5. Actualice asientos disponibles en `Trip`
- Notificar al conductor
- Logging mejorado

### 4. Agregar Tipo de Acción en Logs (`src/types/actions-logs.ts`)
- Agregar `CANCELACION_RESERVA_PASAJERO = 'CANCELACION_RESERVA_PASAJERO'`

### 5. Estados de Reserva a Actualizar
Según tiempo de cancelación:
- `CANCELLED_EARLY` (>24h)
- `CANCELLED_MEDIUM` (12-24h)
- `CANCELLED_LATE` (<12h)

## Estructura de Archivos Nuevos

```
src/
├── schemas/validation/
│   └── cancellation-schema.ts (NUEVO)
├── services/refund/
│   └── refund-calculation-service.ts (NUEVO)
└── actions/trip/
    └── cancel-reservation.ts (MODIFICAR)
```

## Reglas de Negocio Implementadas

### 1.1 Cancelación >24h
- Reembolso 100% precio viaje
- 0% compensación conductor
- Fee siempre retenido
- Estado: `CANCELLED_EARLY`

### 1.2 Cancelación 12-24h
- Reembolso 75% precio viaje
- 25% compensación conductor
- Fee siempre retenido
- Estado: `CANCELLED_MEDIUM`

### 1.3 Cancelación <12h
- Reembolso 50% precio viaje
- 50% compensación conductor
- Fee siempre retenido
- Estado: `CANCELLED_LATE`

### 1.4 Excepción de Reserva Reciente
- Si reservó hace <24h Y cancela en 1h
- Reembolso 100% precio viaje
- 0% compensación conductor
- Fee siempre retenido
- Estado: `CANCELLED_EARLY`

## Ejemplo de Flujo

```typescript
// Pasajero cancela 15 horas antes
{
  precioViaje: 5000,
  serviceFee: 500,
  horasAntes: 15,
  resultado: {
    refundType: "PARTIAL_REFUND_75",
    refundAmount: 3750,      // 75% de 5000
    driverCompensation: 1250, // 25% de 5000
    serviceFeeRetained: 500,  // Siempre retenido
    newStatus: "CANCELLED_MEDIUM"
  }
}
```