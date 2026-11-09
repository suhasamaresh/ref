/**
 * Backend API Latency & Resource Discovery Benchmark
 * ----------------------------------------------------
 * Produces REAL numbers for:
 *   - Table I: Average System Latency for Core Operations
 *   - Table IV: Resource Discovery and Query Performance
 *
 * HOW TO RUN
 *   1. From the project root:  docker-compose up -d mongodb main-backend redis
 *   2. Seed the database so resource search has data to query:
 *        cd backend && npm run seed
 *   3. From this folder:  node backend_latency_benchmark.js
 *
 * Requires Node 18+ (uses built-in fetch). Node v22 is fine.
 */

const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const N_ITER = parseInt(process.env.N_ITER || '50', 10);
const OUTPUT_FILE = process.env.OUTPUT_FILE || 'latency_results.json';

function stats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  const p95 = sorted[p95Index];
  return {
    n: samples.length,
    mean: +mean.toFixed(1),
    median: +median.toFixed(1),
    p95: +p95.toFixed(1),
    min: +sorted[0].toFixed(1),
    max: +sorted[sorted.length - 1].toFixed(1),
  };
}

async function timeRequest(fn, label) {
  const t0 = performance.now();
  let ok = true;
  try {
    await fn();
  } catch (error) {
    ok = false;
    if (process.env.VERBOSE || true) {
      console.error(`  [FAIL] ${label || ''}: ${error.message}`);
    }
  }
  const t1 = performance.now();
  return { ms: t1 - t0, ok };
}

async function registerAndLogin() {
  const email = `bench_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = 'BenchTest123!';

  const reg = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Benchmark User',
      email,
      password,
    }),
  });

  if (!reg.ok) {
    console.warn(`Register returned ${reg.status} - continuing anyway`);
  }

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed during setup: ${loginRes.status}`);
  }

  const data = await loginRes.json();
  const token = data?.data?.accessToken || data?.accessToken || data?.token;

  if (!token) {
    throw new Error('Login response did not include an access token');
  }

  return { email, password, token };
}

async function bench(label, fn, n) {
  const samples = [];
  let failures = 0;

  // warm-up call — print full error if it fails
  try {
    await fn();
  } catch (err) {
    console.error(`\n  [WARMUP FAILED] ${label}: ${err.message}`);
    throw err;  // abort benchmark early with a clear message
  }

  for (let i = 0; i < n; i += 1) {
    const { ms, ok } = await timeRequest(fn, label);
    if (ok) {
      samples.push(ms);
    } else {
      failures += 1;
    }
  }

  const s = stats(samples);
  console.log(
    `${label.padEnd(28)} n=${String(s.n).padEnd(4)} mean=${String(s.mean).padEnd(7)}ms  median=${String(s.median).padEnd(7)}  p95=${String(s.p95).padEnd(7)}  min=${s.min}  max=${s.max}` +
      (failures ? `  (failures=${failures})` : '')
  );
  return { label, ...s, failures };
}

async function main() {
  console.log(`Benchmarking against ${BASE_URL} with ${N_ITER} iterations per operation\n`);

  const health = await fetch(`${BASE_URL}/api/health`);
  if (!health.ok) {
    console.error('Backend not reachable. Did you run `docker-compose up -d`?');
    process.exit(1);
  }

  const { email, password, token } = await registerAndLogin();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const results = [];

  results.push(
    await bench(
      'User authentication (login)',
      async () => {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error(String(response.status));
        await response.json();
      },
      N_ITER
    )
  );

  results.push(
    await bench(
      'Resource search',
      async () => {
        const response = await fetch(`${BASE_URL}/api/resources/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'healthcare', query: 'clinic', location: 'New York', needs: ['medical care'] }),
        });
        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`${response.status} — ${body.slice(0, 300)}`);
        }
        await response.json();
      },
      N_ITER
    )
  );


  results.push(
    await bench(
      'Resource listing (GET)',
      async () => {
        const response = await fetch(`${BASE_URL}/api/resources`);
        if (!response.ok) throw new Error(String(response.status));
        await response.json();
      },
      N_ITER
    )
  );

  results.push(
    await bench(
      'Resource categories',
      async () => {
        const response = await fetch(`${BASE_URL}/api/resources/categories`);
        if (!response.ok) throw new Error(String(response.status));
        await response.json();
      },
      N_ITER
    )
  );

  results.push(
    await bench(
      'Verification status (auth\'d)',
      async () => {
        const response = await fetch(`${BASE_URL}/api/identity/verification-status`, {
          headers: authHeaders,
        });
        if (!response.ok) throw new Error(String(response.status));
        await response.json();
      },
      N_ITER
    )
  );

  console.log('\n--- Markdown table (paste into paper) ---\n');
  console.log('| Operation | Mean Latency (ms) | Median (ms) | p95 (ms) | Min (ms) | Max (ms) |');
  console.log('|---|---|---|---|---|---|');
  for (const row of results) {
    console.log(`| ${row.label} | ${row.mean} | ${row.median} | ${row.p95} | ${row.min} | ${row.max} |`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ base_url: BASE_URL, n_iter: N_ITER, results }, null, 2));
  console.log(`\nRaw results written to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Benchmark failed:', error.message);
  process.exit(1);
});
