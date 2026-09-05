import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, User, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// In-memory fallback so local dev (no DATABASE_URL) can still create/read
// users, e.g. for the /api/dev-login bypass. Not used once a real DB connects.
const memoryUsers = new Map<string, User>();
let memoryUserId = 1;

function upsertUserInMemory(user: InsertUser): void {
  const openId = user.openId as string;
  const existing = memoryUsers.get(openId);
  const merged: User = {
    id: existing?.id ?? memoryUserId++,
    openId,
    name: user.name ?? existing?.name ?? null,
    email: user.email ?? existing?.email ?? null,
    loginMethod: user.loginMethod ?? existing?.loginMethod ?? null,
    role: user.role ?? existing?.role ?? "user",
    sessionVersion: existing?.sessionVersion ?? 0,
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
    lastSignedIn: user.lastSignedIn ?? existing?.lastSignedIn ?? new Date(),
  };
  memoryUsers.set(openId, merged);
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    upsertUserInMemory(user);
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return memoryUsers.get(openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Invalidates every previously issued session token for this user by
// bumping the version embedded in the JWT; verifySession rejects a token
// whose sessionVersion no longer matches the row. Returns the new version.
export async function bumpSessionVersion(openId: string): Promise<number> {
  const db = await getDb();
  if (!db) {
    const existing = memoryUsers.get(openId);
    const nextVersion = (existing?.sessionVersion ?? 0) + 1;
    if (existing) memoryUsers.set(openId, { ...existing, sessionVersion: nextVersion });
    return nextVersion;
  }

  await db
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.openId, openId));

  const [row] = await db
    .select({ sessionVersion: users.sessionVersion })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return row?.sessionVersion ?? 0;
}

// TODO: add feature queries here as your schema grows.
