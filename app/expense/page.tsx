import db from '../utils/index';
import { expense } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import ExpenseForm from './expense-form';
import Link from 'next/link';
import SignOutButton from '../components/sign-out-button';
import { deleteExpenseAction } from '../api/actions/expense';

export default async function ExpensePage() {
  // Replace with authenticated session user ID from Better Auth or Supabase
  const currentUserId = 'user_current_session_id';

  // Parallel fetch: expenses list and total outgoings
  const [expenseList, aggregates] = await Promise.all([
    db
      .select()
      .from(expense)
      .where(eq(expense.userId, currentUserId))
      .orderBy(desc(expense.date), desc(expense.createdAt)),
    db
      .select({
        totalAmount: sql<string>`coalesce(sum(${expense.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(expense)
      .where(eq(expense.userId, currentUserId)),
  ]);

  const total = Number(aggregates[0]?.totalAmount || 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">ExpenseTracker</span>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/income" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                Income
              </Link>
              <Link href="/expense"  className="text-slate-900 dark:text-white border-b-2 border-emerald-500 py-4">
                Expense
              </Link>
            </nav>
          </div>

          {/* Better Auth Sign Out Trigger */}
          <SignOutButton />
        </div>
      </header>
      {/* Header and Aggregate Outgoings */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expense
          </h1>
          <p className="text-sm text-slate-500">
            Categorize purchases, store digital receipts, and record daily expenses.
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 min-w-[200px]">
          <span className="text-xs uppercase tracking-wider font-semibold text-rose-700 dark:text-rose-400">
            Total Outflow
          </span>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">
            -₦{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <ExpenseForm userId={currentUserId} />
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Expense History
            </h2>
            <span className="text-xs text-slate-500">{aggregates[0]?.count ?? 0} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">Description & Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Meta</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenseList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400">
                      No expense records found. Record your first payment using the form.
                    </td>
                  </tr>
                ) : (
                  expenseList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {item.description}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 capitalize">
                          {item.category.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.subcategory}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        {item.receiptImageUrl && (
                          <span
                            className="inline-block text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 mr-1"
                            title="Receipt attached"
                          >
                            📷 Receipt
                          </span>
                        )}
                        {item.barcodeData && (
                          <span
                            className="inline-block text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300"
                            title={`Barcode: ${item.barcodeData}`}
                          >
                            🏷️ Barcode
                          </span>
                        )}
                        {!item.receiptImageUrl && !item.barcodeData && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                        -₦{Number(item.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <form
                          action={async () => {
                            'use server';
                            await deleteExpenseAction(currentUserId, item.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete entry"
                          >
                            ✕
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}