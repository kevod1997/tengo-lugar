// Script de prueba para verificar el cron job de trip completion
// Ejecutar con: npx tsx test-cron-complete-trips.ts

import { completeExpiredTrips } from '../src/actions/trip/complete-trip';

async function testCronJob() {
  console.log('🧪 Testing Cron Job: Complete Expired Trips\n');

  // Mostrar información de timezone para debugging
  const now = new Date();
  console.log('🌍 Timezone Information:');
  console.log(`   - Local time: ${now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`);
  console.log(`   - UTC time: ${now.toISOString()}`);
  console.log(`   - Timezone offset: UTC${now.getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(now.getTimezoneOffset() / 60)}\n`);

  try {
    console.log('⏳ Running complete expired trips...');
    const result = await completeExpiredTrips();

    if (result.success && result.data) {
      console.log('\n✅ Cron job completed successfully!\n');
      console.log('📊 Results:');
      console.log(`   - Processed trips: ${result.data.processedTrips}`);
      console.log(`   - Completed trips: ${result.data.completedTrips}`);
      console.log(`   - Cancelled trips: ${result.data.cancelledTrips}`);
      console.log(`   - Failed: ${result.data.failureCount}`);
      console.log(`   - Skipped: ${result.data.skippedTrips}\n`);

      if (result.data.completedTrips > 0) {
        console.log('📧 Expected review reminder emails:');
        console.log(`   - ${result.data.completedTrips} trip(s) completed`);
        console.log('   - Each trip sends reminders to driver + passengers\n');
        console.log('🔍 Check:');
        console.log('   1. Inngest dashboard: http://localhost:8288');
        console.log('   2. Email inboxes');
        console.log('   3. Database: trips should be COMPLETED');
      }
    } else {
      console.error('❌ Cron job failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCronJob()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
