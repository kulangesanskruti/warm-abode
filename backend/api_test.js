/**
 * api_test.js
 * Tests all the flows affected by the schema mismatch fix.
 * Run from the backend directory: node api_test.js
 */

const BASE = 'http://localhost:5000/api/v1';
let token = '';
let ownerId = '';
let propertyId = '';
let roomId = '';
let bedId = '';
let tenantId = '';
let paymentId = '';

const PASS = (msg) => console.log(`  ✅  ${msg}`);
const FAIL = (msg, detail) => { console.error(`  ❌  ${msg}`); if (detail) console.error('     ', detail); };
const HEAD = (msg) => console.log(`\n──────────────────────────────────────\n${msg}\n──────────────────────────────────────`);

async function api(method, path, body, authToken) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, json };
}

async function run() {
  /* ── 1. Register / Login ─────────────────────────────────────── */
  HEAD('1. Auth — register + login');

  const email = `test_${Date.now()}@stayhub.test`;
  const reg = await api('POST', '/auth/register', {
    fullName: 'Test Owner', email, phone: `+919${Date.now().toString().slice(-9)}`,
    password: 'Password123!', role: 'OWNER',
  });
  if (reg.status === 201 || reg.status === 200) {
    token = reg.json.accessToken || reg.json.data?.accessToken;
    ownerId = reg.json.user?.id || reg.json.data?.user?.id;
    PASS(`Registered — status ${reg.status}`);
  } else {
    FAIL(`Register returned ${reg.status}`, JSON.stringify(reg.json));
    process.exit(1);
  }

  /* ── 2. GET /tenants (the originally-failing endpoint) ────────── */
  HEAD('2. GET /tenants — was returning 500');

  const tenants = await api('GET', '/tenants?limit=100', null, token);
  if (tenants.status === 200) {
    PASS(`GET /tenants → 200 (${tenants.json.data?.tenants?.length ?? tenants.json.total ?? '?'} tenants)`);
  } else {
    FAIL(`GET /tenants → ${tenants.status}`, JSON.stringify(tenants.json));
  }

  /* ── 3. Create property ───────────────────────────────────────── */
  HEAD('3. Create property');

  const prop = await api('POST', '/properties', {
    propertyName: 'Test PG', propertyType: 'PG',
    address: '10 Test St', city: 'Bengaluru', state: 'Karnataka',
    pincode: '560001', country: 'India', totalFloors: 2,
  }, token);
  if (prop.status === 201) {
    propertyId = prop.json.data?.id || prop.json.id;
    PASS(`Property created — id: ${propertyId}`);
  } else {
    FAIL(`Create property → ${prop.status}`, JSON.stringify(prop.json));
    process.exit(1);
  }

  /* ── 4. Create room (beds auto-created from capacity) ─────────── */
  HEAD('4. Create room (capacity=2 → 2 beds auto-generated)');

  const room = await api('POST', '/rooms', {
    propertyId,
    roomNumber: 'R-01', floor: 1, capacity: 2, rentPerBed: 5000, roomType: 'STANDARD',
  }, token);
  if (room.status === 201) {
    roomId = room.json.data?.room?.id || room.json.data?.id || room.json.id;
    // Grab first auto-generated bed
    const beds = room.json.data?.beds || room.json.data?.room?.beds || [];
    bedId = beds[0]?.id;
    PASS(`Room created — id: ${roomId}, beds from response: ${beds.length}`);
    if (bedId) PASS(`First bed id from response: ${bedId}`);
  } else {
    FAIL(`Create room → ${room.status}`, JSON.stringify(room.json));
    process.exit(1);
  }

  /* ── 5. Get beds from room details ────────────────────────────── */
  HEAD('5. Get beds from room details');
  const roomDetails = await api('GET', `/rooms/${roomId}?propertyId=${propertyId}`, null, token);
  if (roomDetails.status === 200) {
    const bList = roomDetails.json.data?.beds || roomDetails.json.data?.room?.beds || roomDetails.json.beds || [];
    if (!bedId && bList.length > 0) bedId = bList[0]?.id;
    PASS(`Room details → ${bList.length} beds, using bed: ${bedId}`);
  } else {
    FAIL(`GET /rooms/${roomId} → ${roomDetails.status}`, JSON.stringify(roomDetails.json));
  }

  // If still no bedId, try available-beds endpoint
  if (!bedId) {
    const bedsRes = await api('GET', `/rooms/${roomId}/available-beds?propertyId=${propertyId}`, null, token);
    if (bedsRes.status === 200) {
      const bList = bedsRes.json.data?.beds || bedsRes.json.beds || [];
      bedId = bList[0]?.id;
      PASS(`available-beds → ${bList.length} beds, using bed: ${bedId}`);
    }
  }

  if (!bedId) {
    FAIL('Could not find any bed for this room — cannot create tenant without bedId');
    process.exit(1);
  }

  /* ── 6. Create tenant ─────────────────────────────────────────── */
  HEAD('6. Create tenant (assign to property/room/bed)');

  const moveIn = new Date();
  moveIn.setDate(1);
  const tenant = await api('POST', '/tenants', {
    propertyId, roomId, bedId,
    fullName: 'Ravi Kumar',
    phone: `+918${Date.now().toString().slice(-9)}`,
    email: `ravi_${Date.now()}@test.com`,
    gender: 'MALE',
    occupation: 'Software Engineer',
    permanentAddress: '12 Main Rd, Chennai, TN',
    emergencyContact: 'Priya Kumar',
    emergencyPhone: '+919876543210',
    monthlyRent: 5000, securityDeposit: 10000,
    moveInDate: moveIn.toISOString(),
  }, token);
  if (tenant.status === 201) {
    tenantId = tenant.json.data?.id || tenant.json.id;
    PASS(`Tenant created — id: ${tenantId}`);
  } else {
    FAIL(`Create tenant → ${tenant.status}`, JSON.stringify(tenant.json));
    process.exit(1);
  }

  /* ── 7. GET /tenants again (verifies ensureCurrentMonthRent) ──── */
  HEAD('7. GET /tenants after tenant creation');

  const tenants2 = await api('GET', '/tenants?limit=100', null, token);
  if (tenants2.status === 200) {
    PASS(`GET /tenants → 200`);
  } else {
    FAIL(`GET /tenants → ${tenants2.status}`, JSON.stringify(tenants2.json));
  }

  /* ── 8. Generate monthly rent ────────────────────────────────── */
  HEAD('8. Generate monthly rent (POST /payments/generate-monthly)');

  const now = new Date();
  const genRent = await api('POST', '/payments/generate-monthly', {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    propertyId,
  }, token);
  if (genRent.status === 200 || genRent.status === 201) {
    const d = genRent.json.data ?? genRent.json;
    PASS(`Generate rent → ${genRent.status} — generated: ${d?.generated}, skipped: ${d?.skipped}, errors: ${d?.errors?.length}`);
  } else {
    FAIL(`Generate rent → ${genRent.status}`, JSON.stringify(genRent.json));
  }

  /* ── 9. Fetch payments ────────────────────────────────────────── */
  HEAD('9. GET /payments');

  const payments = await api('GET', '/payments?limit=10', null, token);
  if (payments.status === 200) {
    const list = payments.json.data?.payments ?? payments.json.payments ?? [];
    paymentId = list[0]?.id;
    PASS(`GET /payments → 200 (${list.length} payments)`);
    if (list[0]) {
      PASS(`payments[0].dueDate = ${list[0].dueDate ?? 'null'}, status = ${list[0].status}`);
    }
  } else {
    FAIL(`GET /payments → ${payments.status}`, JSON.stringify(payments.json));
  }

  /* ── 10. Sync overdue statuses ────────────────────────────────── */
  HEAD('10. Sync overdue (GET /payments/overdue calls syncOverdueStatuses internally)');

  const overdue = await api('GET', '/payments/overdue', null, token);
  if (overdue.status === 200) {
    PASS(`GET /payments/overdue → 200 (syncOverdueStatuses ran successfully)`);
  } else {
    FAIL(`GET /payments/overdue → ${overdue.status}`, JSON.stringify(overdue.json));
  }

  /* ── 11. Pending payments ─────────────────────────────────────── */
  HEAD('11. GET /payments/pending');

  const pending = await api('GET', '/payments/pending', null, token);
  if (pending.status === 200) {
    PASS(`GET /payments/pending → 200`);
  } else {
    FAIL(`GET /payments/pending → ${pending.status}`, JSON.stringify(pending.json));
  }

  /* ── 12. Collect rent ─────────────────────────────────────────── */
  if (tenantId) {
    HEAD('12. Collect rent (POST /payments/collect)');

    const collect = await api('POST', '/payments/collect', {
      tenantId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amountPaid: 5000,
      paymentMethod: 'CASH',
    }, token);
    if (collect.status === 200 || collect.status === 201) {
      PASS(`Collect rent → ${collect.status} — status: ${collect.json.data?.payment?.status ?? collect.json.payment?.status}`);
    } else {
      FAIL(`Collect rent → ${collect.status}`, JSON.stringify(collect.json));
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log('  All tests completed');
  console.log('══════════════════════════════════════\n');
}

run().catch(e => { console.error('Unhandled error:', e.message); process.exit(1); });
