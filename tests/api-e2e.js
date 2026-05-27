const { Client } = require('pg');

const hosts = ['192.168.0.196', '192.168.0.25', '127.0.0.1'];
const dbPassword = 'heyx1234';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY1NzI4MDAwLCJleHAiOjE5MjM0OTQ0MDB9.TvUdo_Zg_svi6SwUiwJtqKatjkbqEw_pCZznEkHDR';

async function testDatabase(host, port) {
  const label = `DB @ ${host}:${port}`;
  console.log(`\nTesting ${label}...`);
  const client = new Client({
    host,
    port,
    user: 'postgres',
    password: dbPassword,
    database: 'postgres',
    ssl: false // try without SSL first
  });
  try {
    await client.connect();
    console.log(`[SUCCESS] ${label} connected!`);
    const scenes = await client.query('SELECT COUNT(*) FROM scenes');
    console.log(`[scenes] Row count: ${scenes.rows[0].count}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`[FAILED] ${label}:`, err.message);
    if (err.stack) {
      console.log('Stack trace:', err.stack.split('\n').slice(0, 3).join('\n'));
    }
    return false;
  }
}

async function testSupabaseGateway(host, port) {
  const url = `http://${host}:${port}/rest/v1/scenes`;
  const label = `API @ ${url}`;
  console.log(`\nTesting ${label}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    console.log(`[Gateway] Status code: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`[SUCCESS] ${label} authorized! Scenes returned: ${data.length}`);
      return true;
    } else {
      const text = await res.text();
      console.error(`[FAILED] ${label} returned error: ${text}`);
      return false;
    }
  } catch (err) {
    console.error(`[FAILED] ${label} fetch failed:`, err.message);
    if (err.stack) {
      console.log('Stack trace:', err.stack.split('\n').slice(0, 3).join('\n'));
    }
    return false;
  }
}

async function run() {
  console.log('==============================================');
  console.log('E2E Diagnostic Test Suite');
  console.log('==============================================');
  
  for (const host of hosts) {
    console.log(`\n=== Diagnosing Host: ${host} ===`);
    // Test DB on typical ports: 15433 (Trae mapped), 54321 (Supabase standard), 5432 (default)
    await testDatabase(host, 15433);
    await testDatabase(host, 54321);
    await testDatabase(host, 5432);
    
    // Test API on typical ports: 8000 (Kong HTTP), 54321 (Supabase standard)
    await testSupabaseGateway(host, 8000);
    await testSupabaseGateway(host, 54321);
  }
  console.log('\n==============================================');
  console.log('Diagnostics completed!');
  console.log('==============================================');
}

run();
