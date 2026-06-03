const DailyUsage   = require("./model/DailyUsage");
const WeeklyUsage  = require("./model/WeeklyUsage");
const MonthlyUsage = require("./model/MonthlyUsage");
const YearlyUsage  = require("./model/YearlyUsage");
const TotalUsage   = require("./model/TotalUsage");

// ─── Period comparison helpers ────────────────────────────────

function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth()    === d2.getMonth()    &&
        d1.getDate()     === d2.getDate()
    );
}

/** Returns the ISO week number (1–53) for a given date. */
function getISOWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day  = date.getUTCDay() || 7;          // Mon=1 … Sun=7
    date.setUTCDate(date.getUTCDate() + 4 - day); // nearest Thursday
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86_400_000) + 1) / 7);
}

function isSameWeek(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        getISOWeek(d1)   === getISOWeek(d2)
    );
}

function isSameMonth(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth()    === d2.getMonth()
    );
}

function isSameYear(d1, d2) {
    return d1.getFullYear() === d2.getFullYear();
}

// ─── Generic upsert helper ────────────────────────────────────
/**
 * Fetches the single doc for a given model.
 * - If no doc exists OR the period has changed → reset count to 1.
 * - If same period → increment count by 1.
 *
 * @param {mongoose.Model} Model
 * @param {(d1: Date, d2: Date) => boolean} isSamePeriod
 * @param {string} label  — used in error messages
 */
async function upsertPeriod(Model, isSamePeriod, label) {
    const now = new Date();
    const doc = await Model.findOne({});

    if (!doc || !isSamePeriod(new Date(doc.updatedAt), now)) {
        // New period (or first run) → reset to 1
        await Model.findOneAndUpdate(
            {},
            { $set: { count: 1 } },
            { upsert: true, new: true, timestamps: true }
        );
    } else {
        // Same period → keep counting up
        await Model.findOneAndUpdate(
            {},
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
    }
}

// ─── Increment helpers ────────────────────────────────────────

async function incrementDaily() {
    try {
        await upsertPeriod(DailyUsage, isSameDay, "daily");
    } catch (error) {
        console.error("incrementDaily error:", error);
    }
}

async function incrementWeekly() {
    try {
        await upsertPeriod(WeeklyUsage, isSameWeek, "weekly");
    } catch (error) {
        console.error("incrementWeekly error:", error);
    }
}

async function incrementMonthly() {
    try {
        await upsertPeriod(MonthlyUsage, isSameMonth, "monthly");
    } catch (error) {
        console.error("incrementMonthly error:", error);
    }
}

async function incrementYearly() {
    try {
        await upsertPeriod(YearlyUsage, isSameYear, "yearly");
    } catch (error) {
        console.error("incrementYearly error:", error);
    }
}

async function incrementTotal() {
    // Total is never reset — always increments
    try {
        await TotalUsage.findOneAndUpdate(
            {},
            { $inc: { count: 1 } },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("incrementTotal error:", error);
    }
}

// ─── Increment ALL counters at once ──────────────────────────

async function incrementAll() {
    await Promise.all([
        incrementDaily(),
        incrementWeekly(),
        incrementMonthly(),
        incrementYearly(),
        incrementTotal(),
    ]);
}

// ─── Get current stats ────────────────────────────────────────

async function getStats() {
    const [daily, weekly, monthly, yearly, total] = await Promise.all([
        DailyUsage.findOne({}),
        WeeklyUsage.findOne({}),
        MonthlyUsage.findOne({}),
        YearlyUsage.findOne({}),
        TotalUsage.findOne({}),
    ]);

    return {
        daily:   daily?.count   ?? 0,
        weekly:  weekly?.count  ?? 0,
        monthly: monthly?.count ?? 0,
        yearly:  yearly?.count  ?? 0,
        total:   total?.count   ?? 0,
    };
}

module.exports = {
    incrementAll,
    incrementDaily,
    incrementWeekly,
    incrementMonthly,
    incrementYearly,
    incrementTotal,
    getStats,
};

