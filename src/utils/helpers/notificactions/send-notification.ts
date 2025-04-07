// import {  } from "@/actions/notifications/push-notifications"

// // Send notification to a single user
// export async function sendUserNotification(
//   userId: string,
//   title: string,
//   body: string,
//   options: {
//     url?: string;
//     icon?: string;
//     requireInteraction?: boolean;
//     tag?: string;
//     data?: Record<string, any>;
//   } = {}
// ) {
//   return sendNotification(
//     userId, 
//     title, 
//     body, 
//     {
//       url: options.url,
//       icon: options.icon,
//       requireInteraction: options.requireInteraction,
//       tag: options.tag,
//       ...options.data
//     }
//   );
// }

// // Send notification for a new trip match
// export async function sendTripMatchNotification(
//   userId: string,
//   tripDetails: {
//     tripId: string;
//     origin: string;
//     destination: string;
//     date: string;
//     driverName?: string;
//   }
// ) {
//   return sendUserNotification(
//     userId,
//     'Nuevo viaje encontrado',
//     `Viaje de ${tripDetails.origin} a ${tripDetails.destination} el ${tripDetails.date}`,
//     {
//       url: `/viajes/${tripDetails.tripId}`,
//       requireInteraction: true,
//       data: {
//         type: 'trip_match',
//         tripId: tripDetails.tripId
//       }
//     }
//   );
// }

// // Send a reminder notification for an upcoming trip
// export async function sendTripReminderNotification(
//   userId: string,
//   tripDetails: {
//     tripId: string;
//     origin: string;
//     destination: string;
//     date: string;
//     time: string;
//   }
// ) {
//   return sendUserNotification(
//     userId,
//     'Recordatorio de viaje',
//     `Tu viaje de ${tripDetails.origin} a ${tripDetails.destination} es hoy a las ${tripDetails.time}`,
//     {
//       url: `/viajes/${tripDetails.tripId}`,
//       requireInteraction: true,
//       data: {
//         type: 'trip_reminder',
//         tripId: tripDetails.tripId
//       }
//     }
//   );
// }