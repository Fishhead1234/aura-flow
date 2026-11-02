import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Aura Flow SQLite database (dev.db)...');

  // Clean existing records in correct relation order
  await prisma.booking.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.clientPass.deleteMany();
  await prisma.classPack.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.studio.deleteMany();
  await prisma.user.deleteMany();

  // 1. Instructor Owner ("Elena Rostova", elena@example.com)
  const elena = await prisma.user.create({
    data: {
      id: 'usr-elena-owner',
      email: 'elena@example.com',
      name: 'Elena Rostova',
      role: 'OWNER',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Existing Student ("Maya Lin", maya@example.com)
  const maya = await prisma.user.create({
    data: {
      id: 'usr-maya-student',
      email: 'maya@example.com',
      name: 'Maya Lin',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Extra Demo Student
  const selina = await prisma.user.create({
    data: {
      id: 'usr-selina-student',
      email: 'selina@example.com',
      name: 'Selina Chen',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Studio ("Sol Sanctuary", slug: "sol-sanctuary")
  const studio = await prisma.studio.create({
    data: {
      id: 'studio-sol-01',
      ownerId: elena.id,
      name: 'Sol Sanctuary',
      slug: 'sol-sanctuary',
      currency: 'USD',
      stripeAccountId: 'acct_sol_sanctuary_8829',
      cancelWindowHours: 12,
      waitlistMinutes: 30,
    },
  });

  // 4. Class Packs
  const pack5 = await prisma.classPack.create({
    data: {
      id: 'pack-5',
      studioId: studio.id,
      name: '5-Class Pack',
      credits: 5,
      price: 115.0,
      expiryDays: 90,
    },
  });

  await prisma.classPack.create({
    data: {
      id: 'pack-10',
      studioId: studio.id,
      name: '10-Class Committed Pack',
      credits: 10,
      price: 210.0,
      expiryDays: 120,
    },
  });

  // 5. Active Pass for Maya Lin (5-pack pass with 2 credits remaining)
  await prisma.clientPass.create({
    data: {
      id: 'pass-maya-01',
      userId: maya.id,
      studioId: studio.id,
      packId: pack5.id,
      creditsRemaining: 2, // 2 credits remaining as specified
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days left
    },
  });

  // 6. Five Initial Classes on Schedule with Realistic Spot Capacities
  const now = new Date();
  const day1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0);
  const day2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15);
  const day3 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30);
  const day4 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 30);
  const day5 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0);

  const sess1 = await prisma.classSession.create({
    data: {
      id: 'sess-01',
      studioId: studio.id,
      title: 'Dynamic Pilates',
      category: 'Reformer',
      instructor: 'Elena Rostova',
      startTime: day1,
      durationMins: 50,
      capacity: 8, // 8 spots (6 booked -> 2 left)
      price: 28.0,
      roomName: 'Reformer Studio A',
    },
  });

  const sess2 = await prisma.classSession.create({
    data: {
      id: 'sess-02',
      studioId: studio.id,
      title: 'Vinyasa Flow',
      category: 'Flow',
      instructor: 'Marcus K.',
      startTime: day2,
      durationMins: 60,
      capacity: 20, // 20 spots (15 booked -> 5 left)
      price: 26.0,
      roomName: 'Zen Bamboo Hall',
    },
  });

  const sess3 = await prisma.classSession.create({
    data: {
      id: 'sess-03',
      studioId: studio.id,
      title: 'Gentle Yin Yoga',
      category: 'Yin Yoga',
      instructor: 'Chloe M.',
      startTime: day3,
      durationMins: 60,
      capacity: 8, // 8 spots (8 booked -> Full • Waitlist Open)
      price: 28.0,
      roomName: 'Warm Cedar Room',
    },
  });

  const sess4 = await prisma.classSession.create({
    data: {
      id: 'sess-04',
      studioId: studio.id,
      title: 'Morning Reformer Sculpt',
      category: 'Reformer',
      instructor: 'Elena Rostova',
      startTime: day4,
      durationMins: 50,
      capacity: 8, // 8 spots (7 booked -> 1 left)
      price: 28.0,
      roomName: 'Reformer Studio A',
    },
  });

  const sess5 = await prisma.classSession.create({
    data: {
      id: 'sess-05',
      studioId: studio.id,
      title: 'Restorative Sound Bath',
      category: 'Sound Bath',
      instructor: 'Maya Lin',
      startTime: day5,
      durationMins: 75,
      capacity: 12, // 12 spots (11 booked -> 1 left)
      price: 35.0,
      roomName: 'Sound Sanctuary',
    },
  });

  // Seed sample bookings for realistic capacities
  await prisma.booking.create({
    data: {
      id: 'b-01',
      sessionId: sess3.id,
      userId: maya.id,
      paymentMethod: 'PASS_CREDIT',
      status: 'CONFIRMED',
    },
  });

  await prisma.booking.create({
    data: {
      id: 'b-02',
      sessionId: sess1.id,
      userId: maya.id,
      paymentMethod: 'PASS_CREDIT',
      status: 'CHECKED_IN',
    },
  });

  // Waitlist for full class
  await prisma.waitlistEntry.create({
    data: {
      id: 'wl-01',
      sessionId: sess3.id,
      userId: selina.id,
      priorityOrder: 1,
      status: 'WAITING',
    },
  });

  console.log('✅ SQLite seeding complete! Created Studio "Sol Sanctuary", Owner Elena Rostova, Student Maya Lin, and 5 classes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
