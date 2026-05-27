const { Client } = require('pg');

const connectionString = 'postgresql://postgres:heyx1234@192.168.0.196:15433/postgres';
const supabaseUrl = 'http://192.168.0.196:8000';

async function testDatabase() {
  console.log('\n--- 1. Testing Database Connectivity (pg) ---');
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('[SUCCESS] Database connected successfully!');

    // Check scenes table
    const scenes = await client.query('SELECT COUNT(*) FROM scenes');
    console.log(`[scenes] Row count: ${scenes.rows[0].count}`);

    // Check photos table
    const photos = await client.query('SELECT COUNT(*) FROM photos');
    console.log(`[photos] Row count: ${photos.rows[0].count}`);

    // Check settings table
    const settings = await client.query('SELECT COUNT(*) FROM settings');
    console.log(`[settings] Row count: ${settings.rows[0].count}`);

    // Fetch sample scenes list
    const scenesList = await client.query('SELECT id, name FROM scenes LIMIT 3');
    console.log('Scenes found:', scenesList.rows);

    await client.end();
    return true;
  } catch (err) {
    console.error('[FAILED] Database E2E check error:', err.message);
    return false;
  }
}

async function testSupabaseGateway() {
  console.log('\n--- 2. Testing Supabase Kong Gateway REST Endpoints ---');
  const url = `${supabaseUrl}/rest/v1/scenes`;
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NzI4MDAwLCJleHAiOjE5MjM0OTQ0MDB9.TvUdo_Zg_svi6SwUiwJtqKatjkbqEw_pCZznEkHDR';
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    console.log(`[Gateway] Status code: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log('[SUCCESS] Kong API gateway successfully authorized and returned data!');
      console.log(`Scenes returned: ${data.length}`);
      return true;
    } else {
      const text = await res.text();
      console.error(`[FAILED] Gateway returned error: ${text}`);
      return false;
    }
  } catch (err) {
    console.error('[FAILED] Supabase gateway fetch failed:', err.message);
    return false;
  }
}

async function run() {
  console.log('==============================================');
  console.log('Birthday Photo - Monorepo E2E Verification');
  console.log('==============================================');
  
  const dbOk = await testDatabase();
  const apiOk = await testSupabaseGateway();
  
  console.log('\n==============================================');
  if (dbOk && apiOk) {
    console.log('🎉 E2E VERIFICATION COMPLETED: ALL CHANNELS PASS!');
  } else {
    console.log('⚠️ E2E VERIFICATION COMPLETED: SOME CHANNELS FAILING.');
  }
  console.log('==============================================');
}

run();
