# Plan de Funcionalidades Post-Viaje - Tengo Lugar

**Fecha:** 03 de Noviembre de 2025
**Versión:** 3.0
**Estado:** Propuesta para Revisión

---

## Resumen Ejecutivo

Actualmente, **Tengo Lugar** completa viajes automáticamente, procesa pagos y gestiona cancelaciones de forma robusta. Sin embargo, **después de que un viaje se completa, la interacción con la plataforma es prácticamente nula**.

Este documento propone implementar **dos sistemas críticos** que faltan:

1. **Sistema de Reviews** - Calificaciones multidireccionales (conductor ↔ pasajero ↔ pasajeros)
2. **Sistema de Reportes** - Extender SupportTicket existente para reportar problemas de viaje

Ambos son **esenciales** para construir confianza, accountability y protección legal en una plataforma de ride-sharing.

---

## Estado Actual

### ✅ Lo que funciona

**Completado de viajes:**
- Automático cada 2 horas (1.5h después de llegada estimada)
- Cambia status: `ACTIVE` → `COMPLETED`
- Actualiza pasajeros: `APPROVED` → `COMPLETED`
- Crea `DriverPayout` automáticamente

**Pagos:**
- Sistema completo de pagos de pasajeros
- Sistema de DriverPayout con cálculo de comisiones
- Workflow de admin para verificación

**Cancelaciones:**
- Reglas de negocio implementadas (reembolsos según timing)
- Compensación al conductor
- Documentación completa

**Sistema de Soporte (SupportTicket):**
- ✅ **Completamente implementado y funcional**
- Creación de tickets con categorías (PAYMENT_ISSUE, TRIP_ISSUE, ACCOUNT_ISSUE, OTHER)
- Admin panel completo con asignación y resolución
- Notificaciones integradas
- UI para usuarios y admins
- **Ya existe categoría `TRIP_ISSUE`** perfecta para problemas de viaje

### ❌ Lo que falta (crítico)

**Sistema de Reviews:**
- Modelo `Review` existe en BD pero **sin implementación**
- Sin server actions, UI, validaciones, ni notificaciones
- Imposible calificar conductores o pasajeros
- No hay reviews entre pasajeros

**Sistema de Reportes de Viaje:**
- `SupportTicket` existe pero **no está relacionado con viajes**
- No hay forma rápida de reportar problemas desde un viaje específico
- Falta campo `tripId` para vincular tickets a viajes

---

## Por Qué Necesitamos Esto

### 1. Confianza y Transparencia

**Problema:**
Sin reviews, usuarios nuevos no tienen información para decidir con quién viajar. Los pasajeros tampoco saben con quién compartirán el viaje.

**Impacto:**
- Conductores de baja calidad pasan desapercibidos
- Pasajeros problemáticos siguen reservando sin consecuencias
- Co-pasajeros no tienen visibilidad de con quién viajarán
- Nuevos usuarios desconfían (no hay prueba social)
- No hay incentivo para excelencia en servicio

**Solución:**
Sistema de reviews públicos que construye reputación de cada usuario (conductor y pasajero).

---

### 2. Accountability y Consecuencias

**Problema:**
No hay forma de documentar ni actuar sobre problemas graves (acoso, conducción peligrosa, no-show).

**Impacto:**
- Issues graves no se rastrean
- Usuarios problemáticos siguen en la plataforma
- Sin datos para suspensiones/bans justificados
- Riesgo legal (sin documentación de incidentes)

**Solución:**
Extender sistema de tickets existente para vincular problemas a viajes específicos, con evidencia y workflow de resolución.

---

### 3. Protección Legal

**Problema:**
Sin evidencia documentada de problemas relacionados con viajes, la plataforma está desprotegida ante disputas legales.

**Impacto:**
- Sin respaldo en caso de accidentes o incidentes
- Difícil defender decisiones de suspensión/ban
- Exposición legal innecesaria

**Solución:**
Sistema de tickets con evidencia (fotos, descripciones) almacenada de forma segura y relacionada al viaje.

---

### 4. Calidad de Servicio

**Problema:**
Sin feedback estructurado, no hay forma de mejorar la calidad del servicio.

**Impacto:**
- No sabemos qué funciona bien y qué no
- Conductores excelentes no son reconocidos ni recompensados
- Problemas recurrentes no se identifican

**Solución:**
Reviews con ratings y comentarios + tickets de problemas permiten análisis y mejora continua.

---

## Qué Vamos a Construir

### FASE 1: Sistema de Reviews Multidireccional

**¿Qué es?**
Sistema de calificaciones donde todos los participantes del viaje pueden calificarse mutuamente:
- Conductor → Pasajeros
- Pasajeros → Conductor
- **Pasajeros → Pasajeros** (opcional)

**¿Cómo funciona?**
- Después de que un viaje se completa, todos pueden dejar reviews
- Rating: 1-5 estrellas (obligatorio)
- Comentarios: texto opcional (max 200 caracteres)
- Ventana de tiempo: **10 días post-viaje**
- Reviews son públicos y permanentes (no editables)

**¿Por qué reviews entre pasajeros?**
- Los pasajeros comparten espacio durante horas
- Ayuda a identificar co-pasajeros confiables vs problemáticos
- Permite a futuros pasajeros saber con quién viajarán
- Aumenta la confianza general en la plataforma

**¿Qué vamos a implementar?**

**Backend:**
- Server actions: `createReview`, `getReviewsForUser`, `canUserReview`, `getPendingReviews`
- Validaciones: Solo usuarios que viajaron juntos pueden calificar
- Lógica: Actualizar `averageRating` y `totalReviews` en cada review
- Notificaciones: Email recordando calificar 24h post-viaje
- Soporte para `revieweeType`: DRIVER o PASSENGER

**Frontend:**
- `ReviewModal` - Modal para calificar con estrellas + textarea
  - Sección principal: Calificar conductor (para pasajeros) o pasajeros (para conductor)
  - Sección opcional: "También puedes calificar a tus compañeros de viaje" (solo pasajeros)
  - Mostrar lista de co-pasajeros con opción de calificar
- `ReviewCard` - Card para mostrar una review
- `ReviewsList` - Lista de reviews en perfil de usuario (separar por tipo: como conductor, como pasajero)
- Botón "Calificar" en viajes completados
- Widget de "Reviews Pendientes" en dashboard con contador

**Reglas de negocio:**
- Una review por usuario por viaje por reviewee
- Solo viajes COMPLETED permiten reviews
- No se puede editar después de enviar
- Pasajeros con status NO_SHOW no pueden dejar review
- Admin puede ocultar reviews ofensivas
- Reviews entre pasajeros son opcionales (no bloquean)
- Pasajeros solo ven co-pasajeros que fueron APPROVED/COMPLETED

**Notificaciones:**
- Cuando viaje pasa a estado COMPLETED: "¿Cómo fue tu viaje con [nombre]?"
- Cuando te califican: "Recibiste una nueva calificación"
- 3 días post-viaje: Segundo recordatorio (si no calificó a conductor)
- No recordatorios para reviews opcionales entre pasajeros

**Experiencia de Usuario:**

**Para Conductor:**
1. Viaje completa → Notificación
2. Abre "Calificar pasajeros" → Ve lista de todos los pasajeros COMPLETED
3. Califica a cada uno: estrellas + comentarios opcionales
4. Envía → Notificación a cada pasajero calificado

**Para Pasajero:**
1. Viaje completa → Notificación
2. Abre "Calificar viaje" → Ve:
   - **Sección principal:** Calificar al conductor (recomendado)
   - **Sección opcional:** "También califica a tus compañeros" con lista de co-pasajeros
3. Califica al conductor (mínimo recomendado)
4. Opcionalmente califica a co-pasajeros
5. Envía → Notificaciones enviadas

---

### FASE 2: Sistema de Reportes de Viaje (Extender SupportTicket)

**¿Qué es?**
Extender el sistema de tickets existente para vincular problemas específicos a viajes, incluyendo no-shows, conducción peligrosa, comportamiento inapropiado, etc.

**¿Por qué NO crear TripIssue nuevo?**
- Ya existe `SupportTicket` completamente implementado y funcional
- Ya tiene categoría `TRIP_ISSUE` específica para problemas de viaje
- Admin panel completo con asignación, resolución, y notificaciones
- UI para usuarios ya construida
- Sistema de notificaciones integrado
- **Reutilizar = 90% menos código + experiencia unificada**

**¿Qué hay que cambiar?**
Solo agregar **un campo opcional** a `SupportTicket`:

**Modificación de BD:**

```prisma
model SupportTicket {
  // ... campos existentes ...
  tripId String? // NUEVO: Relacionar ticket a viaje específico

  // NUEVO: Relación
  trip   Trip?   @relation(fields: [tripId], references: [id])

  // NUEVO: Índice
  @@index([tripId])
}
```

**¿Qué vamos a implementar?**

**Backend:**
- Extender `create-support-ticket.ts` para aceptar `tripId` opcional
- Extender `get-all-tickets.ts` para incluir información del viaje en queries
- Agregar filtro por viaje en admin panel
- Validación: Si `tripId` se provee, usuario debe haber participado en el viaje

**Frontend:**
- **Botón "Reportar Problema"** en página de viaje completado
  - Pre-llena formulario con `tripId` y categoría `TRIP_ISSUE`
  - Opcional: selector de tipo específico (no-show, conducción peligrosa, etc.)
  - Campo de descripción + upload de evidencia (ya existe)
- **Admin Panel** (ya existe, solo mejorar):
  - Mostrar información del viaje cuando `tripId` presente
  - Link directo al viaje desde el ticket
  - Filtro adicional: "Tickets relacionados con viaje [ID]"

**Tipos de Problemas de Viaje Comunes:**

Usando el campo de descripción libre, pero sugiriendo categorías:
- **No-Show:** "El pasajero/conductor no se presentó"
- **Conducción peligrosa:** "El conductor manejaba de forma riesgosa"
- **Comportamiento inapropiado:** "Lenguaje ofensivo, acoso, etc."
- **Vehículo en mal estado:** "Vehículo diferente al publicado, sucio, problemas mecánicos"
- **Llegada tardía:** "Retraso excesivo en punto de encuentro"
- **Desviación de ruta:** "Ruta diferente a la acordada"
- **Daño al vehículo:** "Pasajero causó daño"
- **Otro problema:** Descripción libre

**Flujo de Resolución (ya existe, funciona así):**

1. **Usuario reporta** → Ticket creado con status `OPEN` → Notificación a admins
2. **Admin revisa** → Puede asignarse el ticket → Revisa descripción y evidencia → Puede contactar usuario vía WhatsApp
3. **Admin resuelve** → Cambia status a `RESOLVED` → Agrega notas de resolución → Notifica usuario
4. **Acciones posibles por admin:**
   - Advertencia formal al usuario reportado
   - Suspensión temporal (7/30/90 días)
   - Suspensión permanente
   - Reembolso (si aplica)
   - Cambio de status (ej: marcar TripPassenger como NO_SHOW si se confirma)
   - Escalación a legal (casos graves)

**Casos Especiales: No-Show**

**Flujo actual propuesto:**

1. **Conductor/Pasajero reporta problema via ticket:**
   - Botón "Reportar Problema" en viaje
   - Selecciona tipo: "Usuario no se presentó"
   - Describe situación + sube evidencia (foto punto de encuentro, mensajes)
   - Ticket se crea con categoría `TRIP_ISSUE` + `tripId`

2. **Admin revisa:**
   - Ve información completa del viaje
   - Revisa evidencia
   - Puede contactar a ambas partes
   - Decide si es no-show válido

3. **Si se confirma no-show de pasajero:**
   - Cambiar `TripPassenger.status` a `NO_SHOW`
   - Prevenir reembolso (marcar Payment como no reembolsable)
   - Notificar a pasajero
   - Nota en historial del pasajero

4. **Si se confirma no-show de conductor:**
   - Reembolso automático a todos los pasajeros
   - Penalización grave al conductor
   - Posible suspensión

**Alternativa futura (Fase 1.5 - Opcional):**
- Agregar checkbox en ReviewModal: "Este usuario no se presentó al viaje"
- Solo visible en primeros 2-3 días post-viaje
- Crea automáticamente un ticket con categoría `TRIP_ISSUE`
- Admin revisa igual que cualquier otro ticket

---

## Opciones Post-Viaje para Usuarios

### Para el CONDUCTOR (después de COMPLETED):

1. **Calificar Pasajeros** ⭐ [Recomendado]
   - Por cada pasajero confirmado
   - 1-5 estrellas + comentarios opcionales
   - 10 días para calificar

2. **Reportar Problemas** ⚠️
   - Botón "Reportar Problema" en viaje
   - Abre formulario de ticket con viaje pre-seleccionado
   - No-show del pasajero
   - Comportamiento inapropiado
   - Daño al vehículo
   - Cualquier otro problema

3. **Ver Resumen del Viaje** 📄
   - Pasajeros confirmados
   - Ingresos y estado del pago
   - Reviews recibidas
   - Tickets abiertos (si hay)

---

### Para el PASAJERO (después de COMPLETED):

1. **Calificar Viaje** ⭐ [Recomendado]
   - Calificar al conductor: 1-5 estrellas + comentarios opcionales
   - **Opcional:** Calificar a co-pasajeros
   - 10 días para calificar

2. **Reportar Problemas** ⚠️
   - Botón "Reportar Problema" en viaje
   - Abre formulario de ticket con viaje pre-seleccionado
   - Conducción peligrosa
   - Conductor tardío o no se presentó
   - Vehículo en mal estado
   - Comportamiento inapropiado
   - Cualquier otro problema

3. **Ver Resumen del Viaje** 📄
   - Detalles del viaje
   - Información del conductor
   - Co-pasajeros (si compartieron contacto)
   - Reviews dadas y recibidas
   - Tickets abiertos (si hay)

---

## Flujo Post-Viaje (Timeline)

```
T = 0h (Viaje se completa automáticamente)
│
├─ Inmediatamente:
│  └─ Email: "Tu viaje ha finalizado"
│  └─ Se crea DriverPayout
│  └─ Opciones disponibles: Calificar, Reportar, Ver Resumen
│
├─ T + 24h:
│  └─ Email: "Califica tu experiencia" (conductor y pasajeros principales)
│     Con link directo al formulario de review
│
├─ T + 7d:
│  └─ Email: "Última oportunidad para calificar" (solo si no calificó)
│
└─ T + 10d:
   └─ Ventana de reviews se cierra
   └─ Tickets siguen disponibles (sin límite de tiempo)
```

**Acciones Disponibles:**

| Acción | Actor | Ventana | Requisito |
|--------|-------|---------|-----------|
| Calificar Conductor/Pasajeros | Conductor/Pasajero | 10 días post-COMPLETED | Viaje COMPLETED |
| Calificar Co-pasajeros (opcional) | Pasajero | 10 días post-COMPLETED | Viaje COMPLETED |
| Reportar Problema (ticket) | Conductor/Pasajero | Sin límite | Viaje COMPLETED |
| Ver Resumen/Recibo | Conductor/Pasajero | Sin límite | Viaje COMPLETED |

---

## Consideraciones Importantes

### Seguridad

**Protección contra abuso de reviews:**
- Unique constraint en BD (tripId + reviewerId + reviewedId)
- Solo usuarios que viajaron juntos pueden calificar
- Ventana de tiempo limitada (10 días)
- No edición (permanentes)
- Admin puede ocultar reviews ofensivos
- Rate limiting (max 10 reviews/día)
- Pasajeros solo ven co-pasajeros confirmados (no cancelados)

**Protección contra abuso de tickets:**
- Usuario debe haber participado en el viaje (si tripId presente)
- Sistema de tickets ya tiene validaciones robustas
- Admin revisa antes de tomar acción
- Tracking de tickets falsos
- Rate limiting ya implementado

**Protección de datos:**
- Evidencia almacenada en S3 con encriptación (ya implementado)
- Solo admins ven tickets completos (ya implementado)
- Reviews públicos pero con opción de ocultar usuarios problemáticos
- GDPR compliance
- Retención mínima 2 años para protección legal

---

### Privacidad

**Reviews:**
- Públicos por defecto (transparencia)
- Nombre completo visible (como en BlaBlaCar)
- Admin puede ocultar reviews ofensivos/spam
- No editables una vez enviados
- Separados por rol: reviews como conductor, reviews como pasajero

**Tickets:**
- Privados entre usuario-admin (ya implementado)
- Solo visible para: creador, admins asignados
- Evidencia con acceso restringido
- Logs de acceso

---

### UX: Reviews entre Pasajeros

**¿Cómo evitar que sea abrumador?**

1. **Hacer opcional:** No bloquear ni penalizar si no califican a co-pasajeros
2. **Priorizar conductor:** UI enfatiza calificar al conductor primero
3. **Mostrar contador:** "Has calificado a 1 de 3 pasajeros" (opcional)
4. **No recordatorios:** Solo recordar calificar al conductor, no a co-pasajeros
5. **UI clara:** Sección colapsable "También puedes calificar a tus compañeros"

**Ejemplo de Reviews Posibles:**

Viaje con conductor + 3 pasajeros:
- Conductor → Pasajero 1, 2, 3 (3 reviews)
- Pasajero 1 → Conductor (obligatorio) + Pasajero 2, 3 (opcional) = 1-3 reviews
- Pasajero 2 → Conductor (obligatorio) + Pasajero 1, 3 (opcional) = 1-3 reviews
- Pasajero 3 → Conductor (obligatorio) + Pasajero 1, 2 (opcional) = 1-3 reviews

**Total:** 4-12 reviews posibles (mínimo 4 si solo califican conductor, máximo 12 si todos califican a todos)

---

## Métricas de Éxito

**Sistema de Reviews:**
- **Review Rate (Conductor):** % de viajes donde conductor calificó a pasajeros → Objetivo: >70%
- **Review Rate (Pasajero→Conductor):** % de pasajeros que calificaron a conductor → Objetivo: >60%
- **Review Rate (Pasajero→Pasajero):** % de pasajeros que calificaron a co-pasajeros → Objetivo: >20% (es opcional)
- **Average Rating:** Promedio general de conductores/pasajeros → Objetivo: >4.5
- **Time to Review:** Tiempo promedio para dejar review → Objetivo: <48h

**Sistema de Tickets de Viaje:**
- **Ticket Rate:** % de viajes con tickets reportados → Benchmark: <10%
- **Resolution Time:** Tiempo para resolver tickets → Objetivo: <48h para TRIP_ISSUE
- **Trip-Related Tickets:** % de tickets totales que son TRIP_ISSUE → Métrica de baseline

**Impacto en Negocio:**
- **User Retention:** Retención antes/después de reviews → Hipótesis: aumenta
- **Profile Views:** % usuarios que ven perfiles antes de aprobar/reservar → Hipótesis: aumenta
- **Repeat Trips:** % usuarios que repiten viajes → Hipótesis: aumenta con mejor matching (reviews)

---

## Decisiones Pendientes

### Sistema de Reviews

**1. ¿Ventana de 10 días es correcta?**
- 10 días

**2. ¿Reviews entre pasajeros obligatorios u opcionales?**
- Completamente opcionales - menos fricción

**3. ¿Mostrar todos los reviews juntos o separados?**
- Separar "Como conductor" y "Como pasajero" en perfil

**4. ¿Pasajeros ven nombres de co-pasajeros antes de reservar?**
- Solo después de ser aprobados (privacidad)

---

### Sistema de Tickets

**1. ¿Sugerencias de tipo de problema?**
- Campo libre (ya existe)

**2. ¿Evidencia obligatoria para ciertos tipos?**
- Siempre opcional (menos fricción)

**3. ¿Admin puede cambiar status de pasajero directamente desde ticket?**
- Sí, botones rápidos "Marcar NO_SHOW", "Procesar reembolso"

---

### No-Show

**1. ¿Tiempo de espera antes de reportar?**
- Sin restricción técnica, pero sugerir en UI: "Si esperaste al menos 15 minutos..."
- Admin evalúa si el reporte es razonable

**2. ¿Pasajero puede disputar no-show?**
- Sí, creando otro ticket explicando su versión
- Admin revisa ambos tickets y decide
- Feature de "disputa formal" puede venir después

**3. ¿Penalizaciones automáticas o manuales?**
- Manual: Admin decide penalización caso por caso
- Automático (futuro): Después de X no-shows confirmados

---

## Próximos Pasos

### 1. Validar Decisiones
- ✅ Revisar y aprobar este documento
- ⏳ Responder "Decisiones Pendientes"
- ⏳ Definir prioridades (¿ambas fases o solo reviews primero?)

### 2. Diseño de UI
- Mockups de ReviewModal (con sección de co-pasajeros)
- Mockups de botón "Reportar Problema" en viaje
- Mockups de mejoras a admin panel de tickets

### 3. Plan de Implementación

**Fase 1: Sistema de Reviews (Prioridad Alta)**
- **Backend:**
  - Server actions: createReview, getReviewsForUser, canUserReview
  - Validaciones: tripId + reviewerId + reviewedId unique
  - Lógica: actualizar averageRating/totalReviews
  - Notificaciones: emails de reminder

- **Frontend:**
  - ReviewModal con soporte multidireccional
  - ReviewsList separada por rol
  - Botón "Calificar" en viajes completados
  - Widget de reviews pendientes


**Fase 2: Extensión de Tickets (Prioridad Alta)**
- **Backend:**
  - Migración: agregar tripId a SupportTicket
  - Extender create-support-ticket con tripId
  - Extender get-all-tickets para incluir trip data
  - Validación: usuario participó en viaje

- **Frontend:**
  - Botón "Reportar Problema" en viajes
  - Pre-llenar formulario con tripId
  - Mejorar TicketDetailCard para mostrar trip info
  - Admin filters por tripId


---

## Apéndices

### Modelo de Datos

**Review (ya existe, no cambiar):**
```prisma
model Review {
  id           String       @id @default(uuid())
  tripId       String
  reviewerId   String       // Quien califica
  reviewedId   String       // Quien es calificado
  revieweeType RevieweeType // DRIVER o PASSENGER
  rating       Float        // 1.0 - 5.0
  comments     String?      // Opcional, max 500 chars
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  trip       Trip   @relation(...)
  reviewer   User   @relation("ReviewsGiven", ...)
  reviewed   User   @relation("ReviewsReceived", ...)

  @@unique([tripId, reviewerId, reviewedId]) // Una review por par
  @@index([reviewedId, revieweeType])
}

enum RevieweeType {
  DRIVER
  PASSENGER
}
```

**SupportTicket (modificar - agregar 1 campo):**
```prisma
model SupportTicket {
  id                String         @id @default(uuid())
  ticketNumber      String         @unique
  userId            String
  category          TicketCategory
  subject           String
  description       String
  status            TicketStatus   @default(OPEN)
  assignedToAdminId String?
  resolution        String?
  createdAt         DateTime       @default(now())
  resolvedAt        DateTime?

  tripId            String?        // NUEVO - Opcional

  assignedAdmin     User?          @relation("AssignedTickets", ...)
  user              User           @relation(...)
  trip              Trip?          @relation(...) // NUEVO

  @@index([userId, status])
  @@index([status, createdAt])
  @@index([tripId])                // NUEVO
}

enum TicketCategory {
  PAYMENT_ISSUE
  TRIP_ISSUE    // Ya existe - usaremos este
  ACCOUNT_ISSUE
  OTHER
}

enum TicketStatus {
  OPEN
  RESOLVED
}
```

---

### Ejemplo de Reviews Multidireccionales

**Escenario:** Viaje con conductor Juan y pasajeros: María, Carlos, Ana

**Reviews Obligatorias/Recomendadas:**
- Juan → María (5⭐ "Excelente pasajera")
- Juan → Carlos (4⭐ "Buen pasajero")
- Juan → Ana (5⭐ "Muy puntual")
- María → Juan (5⭐ "Conductor seguro")
- Carlos → Juan (4⭐ "Buena conducción")
- Ana → Juan (5⭐ "Muy amable")

**Reviews Opcionales (entre pasajeros):**
- María → Carlos (5⭐ "Buena compañía")
- María → Ana (5⭐ "Muy simpática")
- Carlos → María (4⭐ "Agradable")
- Carlos → Ana (5⭐ "Buena onda")
- Ana → María (5⭐ "Excelente")
- Ana → Carlos (4⭐ "Buen viaje")

**Resultado en Perfiles:**

**Juan (Conductor):**
- Como conductor: 4.67⭐ (3 reviews de sus pasajeros)
- Total viajes como conductor: X

**María (Pasajera):**
- Como pasajera: 4.67⭐ (1 review de Juan + 2 de co-pasajeros)
- Total viajes como pasajera: X

**Carlos (Pasajero):**
- Como pasajero: 4.33⭐ (1 review de Juan + 2 de co-pasajeros)
- Total viajes como pasajero: X

---

### Referencias

**Documentos existentes:**
- `docs/REGLAS_DE_NEGOCIO_CANCELACIONES.md` - Reglas de cancelación
- `prisma/schema.prisma` - Schema de base de datos
- `src/actions/support/` - Sistema de tickets existente

---

## Resumen de Cambios vs Versión 2.0

**Principales mejoras:**
1. ✅ **Reviews multidireccionales:** Agregado soporte para pasajeros califiquen a co-pasajeros (opcional)
2. ✅ **Reutilización de SupportTicket:** En lugar de crear TripIssue, extender sistema existente
3. ✅ **Ventana reducida:** 10 días (vs 30 días en v2.0)
4. ✅ **Más simple:** 90% menos código nuevo gracias a reutilización
5. ✅ **Experiencia unificada:** Un solo centro de soporte en lugar de múltiples sistemas

---

**Versión:** 3.0
**Última Actualización:** 03 de Noviembre de 2025
**Estado:** Propuesta Final para Revisión y Aprobación
