Plan: Implementación Fase 1 - Sistema de Reviews Multidireccional

Resumen Ejecutivo
Implementar sistema completo de reviews según POST_TRIP_FEATURES_PLAN.md, permitiendo calificaciones bidireccionales (conductor↔pasajero) con reviews opcionales entre pasajeros.

Hallazgos Clave de Investigación
✅ Modelo Review existe y está bien estructurado ❌ Falta constraint único @@unique([tripId, reviewerId, reviewedId]) ✅ Driver/Passenger tienen averageRating y totalReviews ✅ Patrones de código bien establecidos (auth, validation, notifications) ❌ Sin acciones, schemas, ni componentes de review

Plan de Implementación (Orden Recomendado)

FASE A: Database & Schema (Base) ✅

✅ Migración de Base de Datos
✅ Agregar @@unique([tripId, reviewerId, reviewedId]) al modelo Review
✅ Ejecutar npm run prisma:migrate dev 

✅ Actualizar Enums de Logging
✅ Agregar a src/types/actions-logs.ts:
✅ CREATE_REVIEW
✅ VIEW_REVIEWS
✅ GET_PENDING_REVIEWS
✅ CHECK_CAN_REVIEW

FASE B: Validation Layer ✅

✅ Crear Schemas de Validación
✅ src/schemas/validation/review-schema.ts
✅ createReviewSchema: validar tripId, reviewedId, revieweeType, rating (1-5), comments (max 200)
✅ getReviewsForUserSchema: validar userId, revieweeType
✅ getPendingReviewsSchema: validar userId
✅ canUserReviewSchema: validar tripId
✅ Export TypeScript types con z.infer

FASE C: Backend - Server Actions ✅

✅ Acción: Crear Review (src/actions/review/create-review.ts)
✅ Autenticación con requireAuthentication
✅ Validar con createReviewSchema
✅ Verificar:
✅ Trip status = COMPLETED
✅ Usuario participó en el viaje
✅ No existe review duplicada
✅ Dentro de ventana de 10 días
✅ Pasajero no es NO_SHOW
✅ Transaction:
✅ Crear Review
✅ Actualizar Driver.averageRating/totalReviews O Passenger.averageRating/totalReviews
⏳ Notificar al usuario calificado (pendiente - Fase D)
✅ Log con logActionWithErrorHandling
✅ Return con ApiHandler.handleSuccess

✅ Acción: Obtener Reviews (src/actions/review/get-reviews-for-user.ts)
✅ Autenticación con requireAuthentication
✅ Validar con getReviewsForUserSchema
✅ Query Prisma con select específico (performance)
✅ Filtrar por revieweeType (DRIVER o PASSENGER)
✅ Incluir datos de reviewer (nombre, foto)
✅ Return con ApiHandler.handleSuccess

✅ Acción: Validar Permiso (src/actions/review/can-user-review.ts)
✅ Autenticación con requireAuthentication
✅ Verificar:
✅ Trip status = COMPLETED
✅ Usuario participó (como driver o passenger APPROVED/COMPLETED)
✅ No ha calificado aún
✅ Dentro de 10 días
✅ Return lista de usuarios que puede calificar (conductor + co-pasajeros)

✅ Acción: Reviews Pendientes (src/actions/review/get-pending-reviews.ts)
✅ Autenticación con requireAuthentication
✅ Query trips COMPLETED del usuario (últimos 10 días)
✅ Para cada trip, verificar si falta calificar conductor/pasajeros
✅ Return lista con datos del trip y usuarios por calificar

FASE D: Notifications & Background Jobs ✅

✅ Archivo de Configuración (src/lib/constants/review-reminder-config.ts)
✅ Constantes centralizadas: REMINDER_DELAY_HOURS (24h), REVIEW_WINDOW_DAYS (10)
✅ Helper functions: getReviewUrl(tripId), getProfileUrl(userId)
✅ Documentación completa de cada constante

✅ Template de Email (src/emails/templates/ReviewReminder.tsx)
✅ React Email component personalizado según reviewType (driver/passenger)
✅ Diseño consistente con emails existentes (EmailLayout, EmailHeader, EmailFooter)
✅ Props: userName, reviewUrl, tripOrigin, tripDestination, departureDate, reviewType
✅ Link directo a formulario de review con query param ?openReview=true
✅ Información completa del viaje
✅ Icono de estrella ⭐
✅ Mensaje adaptado: "¿Cómo fue tu experiencia con el conductor?" o "...con los pasajeros?"

✅ Template: Review Recibida (src/emails/templates/ReviewReceived.tsx)
✅ Notificar cuando alguien te califica
✅ Props: userName, reviewerName, rating, profileUrl
✅ Mostrar rating visual con estrellas (⭐ x rating)
✅ Texto del rating: "X de 5 estrellas"
✅ Sin comentario (privacidad)
✅ Link a perfil del usuario
✅ Icono de celebración 🎉

✅ Inngest Functions (src/utils/inngest/send-review-reminder.ts)
✅ sendReviewReminder: Función con retry 5 intentos
✅ Event: 'send-review-reminder'
✅ Llamar emailService.sendReviewReminderEmail()
✅ Generar reviewUrl con REVIEW_REMINDER_CONFIG.getReviewUrl()
✅ Log de éxito en console
✅ Error handling con logError() - no falla operaciones principales
✅ sendReviewReceivedNotification: Función con retry 5 intentos
✅ Event: 'review-received-notification'
✅ Llamar emailService.sendReviewReceivedEmail()
✅ Generar profileUrl con REVIEW_REMINDER_CONFIG.getProfileUrl()

✅ EmailService Methods (src/services/email/email-service.ts)
✅ sendReviewReminderEmail(params): método con interface SendReviewReminderEmailParams
✅ Renderizar ReviewReminder template con @react-email/render
✅ Subject: "¡Califica tu viaje en Tengo Lugar!"
✅ From: "Tengo Lugar <info@tengolugar.store>"
✅ sendReviewReceivedEmail(params): método con interface SendReviewReceivedEmailParams
✅ Renderizar ReviewReceived template
✅ Subject: "¡Recibiste una nueva calificación!"

✅ Actualizar Inngest Config (src/lib/inngest.ts)
✅ Event type: 'send-review-reminder' con data interface completa
✅ Event type: 'review-received-notification' con data interface completa
✅ TypeScript types: userId, userName, userEmail, tripId, tripOrigin, tripDestination, departureDate, reviewType, revieweeId, revieweeName
✅ TypeScript types (received): userId, userName, userEmail, reviewerName, rating, tripId

✅ Inngest Route Registration (src/app/api/inngest/route.ts)
✅ Import sendReviewReminder y sendReviewReceivedNotification
✅ Agregar ambas funciones al array de functions en serve()

✅ Integrar en Trip Completion Flow (src/actions/trip/complete-trip.ts)
✅ Después de logging exitoso (línea 128), ANTES de createDriverPayout
✅ Fetch trip con driver y passengers (COMPLETED) completos
✅ Formato de fecha: toLocaleDateString('es-AR') con día, mes largo, año
✅ Enviar evento 'send-review-reminder' a cada pasajero (reviewType: 'DRIVER')
✅ Enviar evento 'send-review-reminder' al conductor (reviewType: 'PASSENGER')
✅ revieweeName dinámico: nombre del conductor o "X pasajero(s)"
✅ Console log: cantidad de reminders enviados
✅ try/catch robusto: errores no fallan trip completion
✅ logError completo con details, fileName, functionName

✅ Integrar en Review Creation (src/actions/review/create-review.ts)
✅ Después de logging exitoso (línea 257)
✅ Fetch reviewedUser (id, name, email) y reviewerUser (name)
✅ Enviar evento 'review-received-notification' al usuario calificado
✅ Console log: notificación enviada
✅ try/catch robusto: errores no fallan review creation
✅ logError completo con details

✅ Actualizar Action Logs (src/types/actions-logs.ts)
✅ SEND_REVIEW_REMINDER = 'SEND_REVIEW_REMINDER'
✅ SEND_REVIEW_RECEIVED_NOTIFICATION = 'SEND_REVIEW_RECEIVED_NOTIFICATION'

✅ Actualizar Exports (src/emails/index.ts)
✅ export { default as ReviewReminder }
✅ export { default as ReviewReceived }

📝 NOTA: Segundo recordatorio (+3 días) NO implementado en Fase D
    - Requeriría cron job adicional para buscar trips sin reviews
    - Se puede agregar en Fase D.5 (opcional)
    - Plan menciona línea 97 pero es feature futura

FASE E: Frontend - Components
ReviewModal Component (src/components/reviews/ReviewModal.tsx)
Props: isOpen, onClose, tripId, reviewableUsers[]
Tabs/Sections:
Principal: Calificar conductor (para pasajeros) o pasajeros (para conductor)
Opcional: Calificar co-pasajeros (solo pasajeros)
Star rating component (1-5)
Textarea para comentarios (max 200 chars)
Form con react-hook-form + zodResolver
Submit a createReview action
Toast notifications
Validación inline
ReviewCard Component (src/components/reviews/ReviewCard.tsx)
Props: review object
Display:
Avatar y nombre del reviewer
Rating (estrellas visuales)
Comentarios
Fecha relativa (hace X días)
Badge de rol (Como conductor / Como pasajero)
Responsive design
ReviewsList Component (src/components/reviews/ReviewsList.tsx)
Props: userId, revieweeType (DRIVER | PASSENGER)
Fetch con getReviewsForUser action
React Query para caching
Tabs para separar "Como Conductor" / "Como Pasajero"
Loading skeleton
Empty state
Paginación (si hay muchas)
PendingReviewsWidget Component (src/components/reviews/PendingReviewsWidget.tsx)
Props: userId
Fetch con getPendingReviews action
Mostrar contador de reviews pendientes
Lista compacta de trips awaiting review
Botón "Calificar" que abre ReviewModal
Posición: Dashboard del usuario

FASE F: Integration & UI Updates
Trip Detail Page Integration
Archivo: src/app/(authenticated)/trips/[tripId]/page.tsx (encontrar el correcto)
Si trip.status = COMPLETED:
Mostrar botón "Calificar Viaje" (para pasajeros)
Mostrar botón "Calificar Pasajeros" (para conductor)
Mostrar reviews ya dejadas (read-only)
Abrir ReviewModal al hacer click
User Profile - Reviews Section
Archivo: Profile page del usuario
Agregar sección "Calificaciones"
Tabs: "Como Conductor" / "Como Pasajero"
Mostrar Driver.averageRating y Passenger.averageRating
Usar ReviewsList component
Mostrar total de reviews
Dashboard Integration
Agregar PendingReviewsWidget en dashboard principal
Notificación badge si hay reviews pendientes

FASE G: Helper Functions ✅

✅ Rating Calculation Helper (src/utils/helpers/rating-helper.ts)
✅ calculateNewAverageRating(currentAvg, totalReviews, newRating)
✅ updateDriverRating(driverId, newRating, tx)
✅ updatePassengerRating(passengerId, newRating, tx)
✅ Usar en create-review.ts

✅ Review Validation Helper (src/utils/helpers/review-validation-helper.ts)
✅ isWithinReviewWindow(tripCompletedAt): boolean
✅ userParticipatedInTrip(userId, tripId): Promise<boolean>
✅ hasAlreadyReviewed(tripId, reviewerId, reviewedId): Promise<boolean>
✅ getReviewableUsersForTrip(userId, tripId): Promise<ReviewableUser[]>

Decisiones de Implementación
✅ Confirmadas del Plan:
Ventana de 10 días ✅
Reviews entre pasajeros opcionales ✅
Separar reviews "Como conductor" / "Como pasajero" ✅
Reviews públicos y permanentes ✅
Comentarios max 200 caracteres ✅

Archivos a Crear (21 nuevos archivos)

Backend (9 archivos)
✅ src/actions/review/create-review.ts
✅ src/actions/review/get-reviews-for-user.ts
✅ src/actions/review/can-user-review.ts
✅ src/actions/review/get-pending-reviews.ts
✅ src/schemas/validation/review-schema.ts
✅ src/utils/helpers/rating-helper.ts
✅ src/utils/helpers/review-validation-helper.ts
✅ src/utils/inngest/send-review-reminder.ts
✅ src/lib/constants/review-reminder-config.ts

Frontend (4 archivos)
⏳ src/components/reviews/ReviewModal.tsx
⏳ src/components/reviews/ReviewCard.tsx
⏳ src/components/reviews/ReviewsList.tsx
⏳ src/components/reviews/PendingReviewsWidget.tsx

Email Templates (2 archivos)
✅ src/emails/templates/ReviewReminder.tsx
✅ src/emails/templates/ReviewReceived.tsx

Archivos a Modificar (8 archivos)
✅ prisma/schema.prisma - agregar unique constraint
✅ src/types/actions-logs.ts - agregar enums + notificación enums
✅ src/lib/inngest.ts - agregar event types (send-review-reminder, review-received-notification)
✅ src/actions/trip/complete-trip.ts - trigger review reminders después de completion
✅ src/actions/review/create-review.ts - trigger review received notification
✅ src/emails/index.ts - export nuevos templates
✅ src/services/email/email-service.ts - agregar métodos sendReviewReminderEmail y sendReviewReceivedEmail
✅ src/app/api/inngest/route.ts - registrar funciones Inngest
⏳ Trip detail page - agregar botón y sección de reviews
⏳ User profile page - agregar sección de reviews
⏳ Dashboard page - agregar PendingReviewsWidget