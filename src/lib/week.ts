// Weeks start Monday 00:00 UTC, so the server (UTC on Vercel) and dev machines agree.

export function getMondayOf(date: Date): Date {
    const thisDate = date.getUTCDate();
    const day = date.getUTCDay();
    const dateDiff = (day === 0) ? 6 : day - 1;
    const mondayDate = thisDate - dateDiff;
    const newDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), mondayDate);

    return new Date(newDate);
}