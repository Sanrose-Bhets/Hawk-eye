import path from "node:path";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../../../prisma/contract.d.js";

const contractJson = require(
  path.join(process.cwd(), "prisma", "contract.json")
) as Contract;

export const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL,
});
