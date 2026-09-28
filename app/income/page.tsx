import db from '../utils/index';
import { income } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import IncomeForm from './income-form';
import { deleteIncomeAction } from '../api/actions/income';

export default async function IncomePage() {
  // Replace with your authenticated session user id from Better Auth or Supabase
  const currentUserId = 'user_current_session_id';

  // Parallel query: list items and compute aggregations
  const [incomeList, aggregates] = await Promise.all([
    db
      .select()
      .from(income)
      .where(eq(income.userId, currentUserId))
      .orderBy(desc(income.date), desc(income.createdAt)),
    db
      .select({
        totalAmount: sql<string>`coalesce(sum(${income.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(income)
      .where(eq(income.userId, currentUserId)),
  ]);

  const total = Number(aggregates[0]?.totalAmount || 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Log and audit all incoming revenue streams and disbursements.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 min-w-[200px]">
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">
            Total Inflow Recorded
          </span>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <IncomeForm userId={currentUserId} />
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Income Records
            </h2>
            <span className="text-xs text-slate-500">{aggregates[0]?.count ?? 0} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3">Source & Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incomeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">
                      No income records logged yet. Use the form to submit your first entry.
                    </td>
                  </tr>
                ) : (
                  incomeList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {item.sourceName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-slate-500 italic mt-0.5">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 capitalize">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        +${Number(item.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <form
                          action={async () => {
                            'use server';
                            await deleteIncomeAction(currentUserId, item.id);
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