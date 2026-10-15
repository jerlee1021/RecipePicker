// Milestone 1 has no login: "me" is the seeded user, found by email.
// When auth arrives, only getCurrentUserId changes; callers stay the same.
import { prisma } from "./prisma";

export const SEED_USER_EMAIL = "owner@recipepicker.local";

export async function getCurrentUserId(): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { email: SEED_USER_EMAIL },
        select: { id: true }
    });
    if (!user) {
        throw new Error(`Seed user ${SEED_USER_EMAIL} not found. Run: npx prisma db seed`);
    }
    return user.id;
}
