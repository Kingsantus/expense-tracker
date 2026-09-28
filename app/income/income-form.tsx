'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createIncomeAction, ActionState } from '../api/actions/income';

const initialState: ActionState = {};

export default function IncomeForm({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const actionWithUserId = createIncomeAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(actionWithUserId, initialState);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Record Income</h2>
        <p className="text-xs text-slate-500">Track all cash inflows into your account</p>
      </div>

      {state.error && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
          Income recorded successfully!
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Source Name *
        </label>
        <input
          name="sourceName"
          type="text"
          placeholder="e.g. Salary, Client project, Mom"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {state.fieldErrors?.sourceName && (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.sourceName[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Income Type *
        </label>
        <select
          name="type"
          defaultValue="salary"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
        >
          <option value="salary">Salary</option>
          <option value="workmanship">Workmanship</option>
          <option value="parent">Parent</option>
          <option value="other">Other</option>
        </select>
        {state.fieldErrors?.type && (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.type[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount ($) *
          </label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {state.fieldErrors?.amount && (
            <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.amount[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Date *
          </label>
          <input
            name="date"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {state.fieldErrors?.date && (
            <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.date[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Any additional context..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm transition shadow-sm"
      >
        {isPending ? 'Saving...' : 'Add Income'}
      </button>
    </form>
  );
}