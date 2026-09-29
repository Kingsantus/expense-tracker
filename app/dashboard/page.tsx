import Link from 'next/link';
import { getDashboardMetrics, TimeInterval } from '../api/actions/dashboard';
import SignOutButton from '../components/sign-out-button';
import TwoSeriesLineChart from './line-chart';
import AiAdvisor from './ai-advisor';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../lib/auth';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string }>;
}) {
  const requestHeaders = await headers();
    
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
    
  if (!session?.user?.id) {
    redirect('/login');
  }
  
  const currentUserId = session.user.id;

  const resolvedParams = await searchParams;
  const interval = (resolvedParams.interval as TimeInterval) || '24h';

  const {
    previousDayExpense,
    previousWeekExpense,
    previousMonthExpense,
    chartData,
    categoryBreakdown,
  } = await getDashboardMetrics(currentUserId, interval);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Navigation Bar with Sign-Out */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">ExpenseTracker</span>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="text-slate-900 dark:text-white border-b-2 border-emerald-500 py-4">
                Dashboard
              </Link>
              <Link href="/income" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                Income
              </Link>
              <Link href="/expense" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
                Expense
              </Link>
            </nav>
          </div>

          {/* Better Auth Sign Out Trigger */}
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-500">Dual-series telemetry and ethical AI spending optimization.</p>
        </div>

        {/* Previous Periods Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Previous Day Expense
            </span>
            <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
              ₦{previousDayExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Full 24-hour cycle of yesterday</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Previous Week Expense
            </span>
            <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
              ₦{previousWeekExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total outflow from last complete week</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Previous Month Expense
            </span>
            <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
              ₦{previousMonthExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Total outflow from prior calendar month</p>
          </div>
        </div>

        {/* Dynamic Two-Series Line Graph (Income vs Expense) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Cashflow Velocity</h2>
              <div className="flex items-center gap-4 text-xs mt-1">
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Income
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Expense
                </span>
              </div>
            </div>

            {/* Interval Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
              {[
                { label: '24 Hours', value: '24h' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
              ].map((tab) => (
                <Link
                  key={tab.value}
                  href={`/dashboard?interval=${tab.value}`}
                  className={`px-3 py-1.5 rounded-md transition ${
                    interval === tab.value
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          <TwoSeriesLineChart data={chartData} />
        </div>

        {/* Ethical AI Spending Advisor */}
        <AiAdvisor categories={categoryBreakdown} />
      </main>
    </div>
  );
}