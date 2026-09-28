import { CategoryBreakdown } from '../api/actions/dashboard';

export default function AiAdvisor({ categories }: { categories: CategoryBreakdown[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span>✨</span> Ethical AI Financial Assistant
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Log recent expenses to receive category diagnostics and ethical savings recommendations.
        </p>
      </div>
    );
  }

  const topCategory = categories[0];
  const topSubcategory = topCategory.subcategories.sort((a, b) => b.total - a.total)[0];
  const totalOutflow = categories.reduce((sum, c) => sum + c.total, 0);
  const topCategoryShare = ((topCategory.total / totalOutflow) * 100).toFixed(0);

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-indigo-600 dark:text-indigo-400">✨</span> Ethical AI Advisor
        </h3>
        <span className="text-[11px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium px-2.5 py-1 rounded-full">
          Ethical Budgeting Active
        </span>
      </div>

      {/* AI Recommendation Alert */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-2">
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          <strong className="text-slate-900 dark:text-white capitalize">{topCategory.category.replace('_', ' ')}</strong> accounts for{' '}
          <strong className="text-indigo-600 dark:text-indigo-400">{topCategoryShare}%</strong> of your monthly outgoings (${topCategory.total.toFixed(2)}). Specifically,{' '}
          <strong className="text-slate-900 dark:text-white">{topSubcategory?.subcategory || 'general items'}</strong> consumed ${topSubcategory?.total.toFixed(2)}.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          💡 Recommendation: Protect non-negotiables like healthcare, essential utilities, and proper nutrition. Focus adjustments on non-essential recurring items in {topSubcategory?.subcategory} to save approximately ${((topCategory.total) * 0.15).toFixed(2)} this month without straining your lifestyle.
        </p>
      </div>

      {/* Breakdown by Category & Subcategories */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Monthly Spend by Category & Subcategory
        </h4>
        <div className="space-y-3">
          {categories.slice(0, 4).map((cat) => {
            const pct = Math.round((cat.total / totalOutflow) * 100);
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="capitalize text-slate-800 dark:text-slate-200">
                    {cat.category.replace('_', ' ')}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    ${cat.total.toFixed(2)} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subcategories.map((sub) => (
                    <span key={sub.subcategory} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {sub.subcategory}: ${sub.total.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}