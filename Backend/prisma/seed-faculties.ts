import { Temporal } from 'temporal-polyfill';
globalThis.Temporal = Temporal;
import 'dotenv/config';
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

const FACULTIES = [
  { name: 'Computing', description: 'Faculty of Computing' },
  {
    name: 'Computing with AI',
    description: 'Faculty of Computing with Artificial Intelligence',
  },
];

async function main() {
  const now = Temporal.Instant.fromEpochMilliseconds(Date.now());

  for (const faculty of FACULTIES) {
    const existing = await db.orm.public.Faculty.where({
      name: faculty.name,
    }).first();
    if (!existing) {
      await db.orm.public.Faculty.create({
        ...faculty,
        updatedAt: now,
      });
      console.log(`Created faculty: ${faculty.name}`);
    } else {
      console.log(`Faculty already exists: ${faculty.name}`);
    }
  }

  await db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
