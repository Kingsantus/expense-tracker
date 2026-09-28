import {
  pgTable,
  text,
  timestamp,
  boolean,
  numeric,
  uuid,
  index,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

// ==========================================
// 1. ENUMS
// ==========================================

export const incomeTypeEnum = pgEnum("income_type", [
  "salary",
  "workmanship",
  "parent",
  "investment",
  "gift",
  "side_hustle",
  "other",
]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "food",
  "house_rent",
  "utility",
  "transport",
  "entertainment",
  "healthcare",
  "education",
  "shopping",
  "travel",
  "insurance",
  "taxes",
  "savings",
  "investment",
  "donation",
  "personal_care",
  "subscriptions",
  "family",
  "pets",
  "gifts",
  "other",
]);

export const receiptScanStatusEnum = pgEnum("receipt_scan_status", [
  "pending",
  "completed",
  "failed",
  "none",
]);

// ==========================================
// 2. BETTER AUTH CORE TABLES
// ==========================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("session_user_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("account_user_idx").on(table.userId)]
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ==========================================
// 3. TRACKER DOMAIN TABLES
// ==========================================

export const income = pgTable(
  "income",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sourceName: text("source_name").notNull(),
    type: incomeTypeEnum("type").notNull().default("other"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("income_user_date_idx").on(table.userId, table.date),
    index("income_type_idx").on(table.type),
  ]
);

export const expense = pgTable(
  "expense",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: expenseCategoryEnum("category").notNull(),
    subcategory: text("subcategory").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),

    // Optional receipt capture & barcode scanning data
    receiptImageUrl: text("receipt_image_url"),
    barcodeData: text("barcode_data"),
    scanStatus: receiptScanStatusEnum("scan_status").default("none").notNull(),
    ocrMetadata: jsonb("ocr_metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("expense_user_date_idx").on(table.userId, table.date),
    index("expense_category_idx").on(table.userId, table.category),
    index("expense_subcategory_idx").on(table.userId, table.subcategory),
  ]
);

// Stores generated AI spending insights and ethical saving suggestions
export const aiBudgetInsight = pgTable(
  "ai_budget_insight",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    topCategory: text("top_category").notNull(),
    topSubcategory: text("top_subcategory").notNull(),
    percentageOfTotal: numeric("percentage_of_total", {
      precision: 5,
      scale: 2,
    }).notNull(),
    ethicalAdvice: text("ethical_advice").notNull(),
    suggestedSavingsTarget: numeric("suggested_savings_target", {
      precision: 12,
      scale: 2,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("ai_insight_user_idx").on(table.userId, table.createdAt)]
);

// ==========================================
// 4. DRIZZLE RELATIONS (v2 Unified Map)
// ==========================================

export const relations = defineRelations(
  { user, session, account, income, expense, aiBudgetInsight },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      incomes: r.many.income({
        from: r.user.id,
        to: r.income.userId,
      }),
      expenses: r.many.expense({
        from: r.user.id,
        to: r.expense.userId,
      }),
      insights: r.many.aiBudgetInsight({
        from: r.user.id,
        to: r.aiBudgetInsight.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    income: {
      user: r.one.user({
        from: r.income.userId,
        to: r.user.id,
      }),
    },
    expense: {
      user: r.one.user({
        from: r.expense.userId,
        to: r.user.id,
      }),
    },
    aiBudgetInsight: {
      user: r.one.user({
        from: r.aiBudgetInsight.userId,
        to: r.user.id,
      }),
    },
  })
);