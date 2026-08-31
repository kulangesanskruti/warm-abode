/**
 * End-to-end verification of the rent automation pipeline against a real
 * database: scheduler -> rent generation -> notifications -> repository reads.
 *
 * Run with: npx tsx scripts/verify-automation.ts
 */
import { getPrismaClient, disconnectPrisma } from "../src/utils/prisma";
import { automationScheduler } from "../src/schedulers/automationScheduler";
import { runSchedulerTick } from "../src/schedulers/index";
import { notificationRepository } from "../src/repositories/notificationRepository";

const prisma = getPrismaClient();

const results: Array<{ name: string; pass: boolean; detail: string }> = [];
function check(name: string, pass: boolean, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}${detail ? ` :: ${detail}` : ""}`);
}

const TAG = "verify-automation";

async function reset() {
  const owners = await prisma.user.findMany({ where: { email: { contains: TAG } } });
  for (const owner of owners) {
    await prisma.notification.deleteMany({ where: { userId: owner.id } });
    await prisma.property.deleteMany({ where: { ownerId: owner.id } });
    await prisma.user.deleteMany({ where: { id: owner.id } });
  }
  await prisma.schedulerRun.deleteMany({});
  await prisma.schedulerLock.deleteMany({});
}

async function seed() {
  const owner = await prisma.user.create({
    data: {
      fullName: "Verify Owner",
      email: `owner-${TAG}@example.com`,
      phone: `9${Date.now().toString().slice(-9)}`,
      passwordHash: "x",
      role: "OWNER",
    },
  });
  const property = await prisma.property.create({
    data: {
      ownerId: owner.id,
      propertyName: "Verify Residency",
      propertyType: "PG",
      address: "1 Test Street",
      city: "Pune",
      state: "MH",
      pincode: "411001",
      country: "India",
      totalFloors: 1,
      status: "ACTIVE",
    },
  });
  const room = await prisma.room.create({
    data: { propertyId: property.id, roomNumber: "101", floor: 1, capacity: 2, rentPerBed: 8000 },
  });
  const bedA = await prisma.bed.create({ data: { roomId: room.id, bedNumber: "A" } });
  const bedB = await prisma.bed.create({ data: { roomId: room.id, bedNumber: "B" } });

  // Moved in on the 1st of a past month => due on the 1st => already overdue
  // by the time the current month is generated (as long as today is not the 1st).
  const overdueTenant = await prisma.tenant.create({
    data: {
      propertyId: property.id,
      roomId: room.id,
      bedId: bedA.id,
      fullName: "Overdue Tenant",
      phone: `8${Date.now().toString().slice(-9)}`,
      email: `overdue-${TAG}@example.com`,
      gender: "MALE",
      emergencyContact: "9999999999",
      moveInDate: new Date(Date.UTC(new Date().getFullYear() - 1, 0, 1)),
      securityDeposit: 8000,
      monthlyRent: 8000,
      status: "ACTIVE",
    },
  });
  const futureTenant = await prisma.tenant.create({
    data: {
      propertyId: property.id,
      roomId: room.id,
      bedId: bedB.id,
      fullName: "Upcoming Tenant",
      phone: `7${Date.now().toString().slice(-9)}`,
      email: `upcoming-${TAG}@example.com`,
      gender: "FEMALE",
      emergencyContact: "9999999999",
      moveInDate: new Date(Date.UTC(new Date().getFullYear() - 1, 0, 28)),
      securityDeposit: 8000,
      monthlyRent: 8000,
      status: "ACTIVE",
    },
  });

  return { owner, property, room, overdueTenant, futureTenant };
}

async function main() {
  await reset();
  const { owner, property, overdueTenant, futureTenant } = await seed();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  // A previous-month rent row that is already PAID must never be touched.
  const paidPrev = await prisma.payment.create({
    data: {
      tenantId: overdueTenant.id,
      propertyId: property.id,
      roomId: overdueTenant.roomId,
      bedId: overdueTenant.bedId,
      month: prevMonth,
      year: prevYear,
      rentAmount: 8000,
      paidAmount: 8000,
      outstandingAmount: 0,
      status: "PAID",
      dueDate: new Date(Date.UTC(prevYear, prevMonth - 1, 1)),
      paymentDate: new Date(Date.UTC(prevYear, prevMonth - 1, 1)),
    },
  });

  // ---- Test 1: monthly automatic rent generation -------------------------
  const run1 = await automationScheduler.monthlyRent(now);
  const rents = await prisma.payment.findMany({
    where: { propertyId: property.id, month, year },
  });
  check(
    "Monthly automatic rent generation creates one rent row per active tenant",
    rents.length === 2,
    `created=${rents.length} runGenerated=${(run1 as { generated?: number }).generated}`,
  );

  // ---- Test 2: duplicate prevention across repeated runs ----------------
  const run2 = await automationScheduler.monthlyRent(now);
  const run3 = await automationScheduler.monthlyRent(now, { force: true });
  const afterRepeat = await prisma.payment.count({
    where: { propertyId: property.id, month, year },
  });
  check(
    "Repeated scheduler runs create no duplicate rent rows",
    afterRepeat === 2,
    `rows=${afterRepeat} secondRun=${JSON.stringify(run2)} forcedRun=${JSON.stringify(run3)}`,
  );

  // ---- Test 3: startup recovery (server was down on the 1st) ------------
  await prisma.payment.deleteMany({ where: { propertyId: property.id, month, year } });
  await prisma.schedulerRun.deleteMany({});
  const recovery = await automationScheduler.recoverOnStartup(now);
  const recovered = await prisma.payment.count({
    where: { propertyId: property.id, month, year },
  });
  check(
    "Startup recovery regenerates the current month when it was missed",
    recovered === 2,
    `rows=${recovered} recovery=${JSON.stringify(recovery)}`,
  );

  // ---- Test 4: overdue status + exactly one overdue notification --------
  await automationScheduler.paymentStatuses(now);
  await automationScheduler.paymentStatuses(now); // run twice on purpose
  const overduePayment = await prisma.payment.findFirst({
    where: { tenantId: overdueTenant.id, month, year },
  });
  const overdueNotifs = await prisma.notification.findMany({
    where: { userId: owner.id, dedupeKey: { startsWith: "rent-overdue:" } },
  });
  check(
    "Past-due rent transitions to OVERDUE",
    overduePayment?.status === "OVERDUE",
    `status=${overduePayment?.status} dueDate=${overduePayment?.dueDate?.toISOString()}`,
  );
  const overdueKeys = new Set(overdueNotifs.map((n) => n.dedupeKey));
  check(
    "Only one overdue notification per rent record even across repeated ticks",
    overdueNotifs.length === overdueKeys.size &&
      overdueKeys.size === (await prisma.payment.count({
        where: { propertyId: property.id, month, year, status: "OVERDUE" },
      })),
    `notifications=${overdueNotifs.length} uniqueKeys=${overdueKeys.size}`,
  );

  // ---- Test 5: PAID previous-month rent is unchanged --------------------
  const paidAfter = await prisma.payment.findUnique({ where: { id: paidPrev.id } });
  check(
    "PAID previous-month rent remains unchanged",
    paidAfter?.status === "PAID" && Number(paidAfter?.paidAmount) === 8000,
    `status=${paidAfter?.status} paid=${paidAfter?.paidAmount}`,
  );

  // ---- Test 6: rent-due notifications, deduped -------------------------
  const rentDue = await prisma.notification.findMany({
    where: { userId: owner.id, dedupeKey: { startsWith: "rent-due:" } },
  });
  const dueForFuture = rentDue.filter((n) => n.tenantId === futureTenant.id);
  check(
    "One rent-due notification per tenant per billing month",
    rentDue.length === 2 && dueForFuture.length === 1,
    `total=${rentDue.length} titles=${rentDue.map((n) => n.title).join(" | ")}`,
  );

  // ---- Test 7: full scheduler tick is idempotent -----------------------
  const tick = await runSchedulerTick(now);
  const finalRents = await prisma.payment.count({
    where: { propertyId: property.id, month, year },
  });
  const finalNotifs = await prisma.notification.count({ where: { userId: owner.id } });
  check(
    "Full scheduler tick stays idempotent",
    finalRents === 2,
    `rents=${finalRents} notifications=${finalNotifs} tick=${JSON.stringify(tick)}`,
  );

  // ---- Test 8: notifications are readable through the API repository ----
  const listed = await notificationRepository.list(owner.id, { page: 1, limit: 20 });
  const unread = await notificationRepository.unreadCount(owner.id);
  check(
    "Notification list/unread-count API layer returns the generated notifications",
    listed.items.length === listed.total && listed.total >= 3 && unread === listed.total,
    `total=${listed.total} unread=${unread} sample=${listed.items[0]?.title ?? "none"}`,
  );

  console.log("\n--- notifications in DB ---");
  for (const n of listed.items)
    console.log(`${n.type} | ${n.priority} | ${n.title} | ${n.message}`);

  const failed = results.filter((r) => !r.pass);
  console.log(
    `\n=== ${results.length - failed.length}/${results.length} checks passed — ${failed.length ? "FAIL" : "PASS"} ===`,
  );

  await disconnectPrisma();
  process.exit(failed.length ? 1 : 0);
}

void main().catch(async (error) => {
  console.error("verification crashed", error);
  await disconnectPrisma();
  process.exit(1);
});
