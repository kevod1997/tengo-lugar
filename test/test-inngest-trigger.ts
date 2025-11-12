// Script de prueba para verificar triggers de Inngest
// Ejecutar con: npx tsx test-inngest-trigger.ts

import { inngest } from '../src/lib/inngest';

async function testReviewReminderTrigger() {
  console.log('🧪 Testing Inngest Review Reminder Trigger...');

  try {
    await inngest.send({
      name: 'send-review-reminder',
      data: {
        userId: 'test-user-123',
        userName: 'Juan Test',
        userEmail: 'kevindefalco@hotmail.com', // CAMBIAR POR TU EMAIL
        tripId: 'test-trip-123',
        tripOrigin: 'Buenos Aires',
        tripDestination: 'Córdoba',
        departureDate: '15 de noviembre de 2025',
        reviewType: 'DRIVER' as const,
        revieweeId: 'driver-456',
        revieweeName: 'Carlos González'
      }
    });

    console.log('✅ Review reminder event sent to Inngest!');
    console.log('   Check Inngest dashboard: http://localhost:8288');
  } catch (error) {
    console.error('❌ Failed to send event:', error);
  }
}

async function testReviewReceivedTrigger() {
  console.log('🧪 Testing Inngest Review Received Trigger...');

  try {
    await inngest.send({
      name: 'review-received-notification',
      data: {
        userId: 'test-user-789',
        userName: 'María Test',
        userEmail: 'kevindefalco@hotmail.com', // CAMBIAR POR TU EMAIL
        reviewerName: 'Juan Pérez',
        rating: 5,
        tripId: 'test-trip-123'
      }
    });

    console.log('✅ Review received notification event sent to Inngest!');
    console.log('   Check Inngest dashboard: http://localhost:8288');
  } catch (error) {
    console.error('❌ Failed to send event:', error);
  }
}

// Ejecutar tests
testReviewReminderTrigger()
  .then(() => new Promise(resolve => setTimeout(resolve, 1000))) // Wait 1 second
  .then(() => testReviewReceivedTrigger())
  .then(() => {
    console.log('\n✅ All Inngest triggers sent!');
    console.log('   Monitor execution in Inngest dashboard');
    console.log('   You should receive 2 emails');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Inngest trigger tests failed:', error);
    process.exit(1);
  });
