import { Temporal } from 'temporal-polyfill';
globalThis.Temporal = Temporal;
import 'dotenv/config';
import bcrypt from 'bcrypt';
import postgres from '@prisma/orm-postgres/runtime';
import path from 'node:path';
import type { Contract } from './contract.d.js';

const contractJson = require(
  path.join(process.cwd(), 'prisma', 'contract.json'),
) as Contract;

const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL,
});

async function main() {
  const salt = await bcrypt.genSalt(10);

  const serviceEmail = process.env.SEED_SERVICE_EMAIL!;
  const servicePassword = await bcrypt.hash(
    process.env.SEED_SERVICE_PASSWORD!,
    salt,
  );

  const rteEmail = process.env.SEED_RTE_EMAIL!;
  const rtePassword = await bcrypt.hash(process.env.SEED_RTE_PASSWORD!, salt);

  const existingService = await db.orm.public.StudentService.where({
    email: serviceEmail,
  }).first();
  if (!existingService) {
    await db.orm.public.StudentService.create({
      email: serviceEmail,
      password: servicePassword,
      role: 'STUDENT_SERVICE',
      updatedAt: Temporal.Instant.fromEpochMilliseconds(Date.now()),
    });
    console.log(`Seeded StudentService: ${serviceEmail}`);
  } else {
    console.log(`StudentService already exists: ${serviceEmail}`);
  }

  const existingRte = await db.orm.public.RTE.where({
    email: rteEmail,
  }).first();
  if (!existingRte) {
    await db.orm.public.RTE.create({
      email: rteEmail,
      password: rtePassword,
      role: 'RTE',
      updatedAt: Temporal.Instant.fromEpochMilliseconds(Date.now()),
    });
    console.log(`Seeded RTE: ${rteEmail}`);
  } else {
    console.log(`RTE already exists: ${rteEmail}`);
  }

  await db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
