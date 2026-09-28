'use server';

import db from '../../utils/index';
import { income, expense } from '../../db/schema';
import { eq, and, gte, lt, sql, desc, SQL } from 'drizzle-orm';

export type TimeInterval = '24h' | 'weekly' | 'monthly' | 'yearly';

export interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  subcategories: { subcategory: string; total: number }[];
}

export async function getDashboardMetrics(userId: string, interval: TimeInterval = '24h') {
  const now = new Date();

  // --- Previous Period Comparisons ---
  // Previous Day (Yesterday: 00:00 to 23:59:59)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  // Previous Week (Monday to Sunday of last week)
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const startOfCurrentWeek = new Date(startOfToday.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
  const startOfPrevWeek = new Date(startOfCurrentWeek.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Previous Month
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [prevDayRes, prevWeekRes, prevMonthRes] = await Promise.all([
    db
      .select({ total: sql<string>`coalesce(sum(${expense.amount}), 0)` })
      .from(expense)
      .where(and(eq(expense.userId, userId), gte(expense.date, startOfYesterday), lt(expense.date, startOfToday))),
    db
      .select({ total: sql<string>`coalesce(sum(${expense.amount}), 0)` })
      .from(expense)
      .where(and(eq(expense.userId, userId), gte(expense.date, startOfPrevWeek), lt(expense.date, startOfCurrentWeek))),
    db
      .select({ total: sql<string>`coalesce(sum(${expense.amount}), 0)` })
      .from(expense)
      .where(and(eq(expense.userId, userId), gte(expense.date, startOfPrevMonth), lt(expense.date, startOfCurrentMonth))),
  ]);

  const previousDayExpense = Number(prevDayRes[0]?.total || 0);
  const previousWeekExpense = Number(prevWeekRes[0]?.total || 0);
  const previousMonthExpense = Number(prevMonthRes[0]?.total || 0);

  // --- Dynamic Line Chart Time Bucketing ---
  let intervalStartDate: Date;
  let dateTruncUnit: string;
  let labelSql: SQL<string>;

  if (interval === '24h') {
    // 24 hours back, hourly points
    intervalStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    dateTruncUnit = 'hour';
    labelSql = sql<string>`to_char(date_trunc('hour', date), 'HH24:00')`;
  } else if (interval === 'weekly') {
    // 7 days of the week
    intervalStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateTruncUnit = 'day';
    labelSql = sql<string>`to_char(date_trunc('day', date), 'Dy, Mon DD')`;
  } else if (interval === 'monthly') {
    // 4 to 5 weeks in the month
    intervalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    dateTruncUnit = 'week';
    labelSql = sql<string>`'Week ' || to_char(date_trunc('week', date), 'WW')`;
  } else {
    // 12 calendar months of the current year
    intervalStartDate = new Date(now.getFullYear(), 0, 1);
    dateTruncUnit = 'month';
    labelSql = sql<string>`to_char(date_trunc('month', date), 'Mon YYYY')`;
  }

  const [incomeBuckets, expenseBuckets] = await Promise.all([
    db
      .select({
        label: labelSql,
        bucket: sql<string>`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${income.date})`,
        total: sql<string>`sum(${income.amount})`,
      })
      .from(income)
      .where(and(eq(income.userId, userId), gte(income.date, intervalStartDate)))
      .groupBy(sql`1, 2`)
      .orderBy(sql`2`),
    db
      .select({
        label: labelSql,
        bucket: sql<string>`date_trunc(${sql.raw(`'${dateTruncUnit}'`)}, ${expense.date})`,
        total: sql<string>`sum(${expense.amount})`,
      })
      .from(expense)
      .where(and(eq(expense.userId, userId), gte(expense.date, intervalStartDate)))
      .groupBy(sql`1, 2`)
      .orderBy(sql`2`),
  ]);

  // Merge points: only include timestamps where at least one series has recorded data
  const pointsMap = new Map<string, { label: string; income: number; expense: number }>();

  incomeBuckets.forEach((item) => {
    pointsMap.set(item.label, {
      label: item.label,
      income: Number(item.total),
      expense: 0,
    });
  });

  expenseBuckets.forEach((item) => {
    const existing = pointsMap.get(item.label);
    if (existing) {
      existing.expense = Number(item.total);
    } else {
      pointsMap.set(item.label, {
        label: item.label,
        income: 0,
        expense: Number(item.total),
      });
    }
  });

  const chartData: ChartDataPoint[] = Array.from(pointsMap.values());

  // --- Category & Subcategory Outflow Aggregation (AI Advisor Data) ---
  const rawBreakdowns = await db
    .select({
      category: expense.category,
      subcategory: expense.subcategory,
      total: sql<string>`sum(${expense.amount})`,
    })
    .from(expense)
    .where(and(eq(expense.userId, userId), gte(expense.date, startOfCurrentMonth)))
    .groupBy(expense.category, expense.subcategory)
    .orderBy(desc(sql`sum(${expense.amount})`));

  const breakdownMap: Record<string, CategoryBreakdown> = {};
  rawBreakdowns.forEach((row) => {
    const cat = row.category;
    const amount = Number(row.total);
    if (!breakdownMap[cat]) {
      breakdownMap[cat] = { category: cat, total: 0, subcategories: [] };
    }
    breakdownMap[cat].total += amount;
    breakdownMap[cat].subcategories.push({
      subcategory: row.subcategory,
      total: amount,
    });
  });

  const categoryBreakdown = Object.values(breakdownMap).sort((a, b) => b.total - a.total);

  return {
    previousDayExpense,
    previousWeekExpense,
    previousMonthExpense,
    chartData,
    categoryBreakdown,
  };
}