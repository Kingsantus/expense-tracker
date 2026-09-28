'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  EXPENSE_CATEGORIES,
  SUBCATEGORIES_BY_CATEGORY,
  ExpenseCategory,
} from '../lib/constants/expenses';
import { createExpenseAction, ExpenseActionState } from '../api/actions/expense';

const initialState: ExpenseActionState = {};

export default function ExpenseForm({ userId }: { userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const actionWithUserId = createExpenseAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(actionWithUserId, initialState);

  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('food');
  const [typedSubcategory, setTypedSubcategory] = useState<string>('');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [showBarcodeField, setShowBarcodeField] = useState(false);

  // Automatically require typing if category is "other", or if manual override is toggled
  const isTypingRequired = selectedCategory === 'other' || isManualOverride;
  const currentCategoryDropdownItems = SUBCATEGORIES_BY_CATEGORY[selectedCategory] || [];

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      setReceiptPreview(null);
      setBarcodeInput('');
      setTypedSubcategory('');
      setIsManualOverride(false);
    }
  }, [state.success]);

  const handleReceiptCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Record Expense</h2>
        <p className="text-xs text-slate-500">Track and categorize outgoings with receipts</p>
      </div>

      {state.error && (
        <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
          Expense saved successfully!
        </div>
      )}

      {/* Category Dropdown */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Category *
        </label>
        <select
          name="category"
          value={selectedCategory}
          onChange={(e) => {
            const nextCat = e.target.value as ExpenseCategory;
            setSelectedCategory(nextCat);
            setTypedSubcategory('');
            if (nextCat === 'other') {
              setIsManualOverride(true);
            } else {
              setIsManualOverride(false);
            }
          }}
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white capitalize focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory: Free-text input when "other" is picked, else dropdown with optional manual override */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Subcategory *
          </label>
          {selectedCategory !== 'other' && (
            <button
              type="button"
              onClick={() => {
                setIsManualOverride(!isManualOverride);
                setTypedSubcategory('');
              }}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline"
            >
              {isManualOverride ? 'Pick from dropdown' : '+ Type custom subcategory'}
            </button>
          )}
        </div>

        {isTypingRequired ? (
          <input
            name="subcategory"
            type="text"
            placeholder={
              selectedCategory === 'other'
                ? 'Type custom subcategory (e.g. Workshop fee, Legal, etc.)'
                : 'Type specific subcategory...'
            }
            value={typedSubcategory}
            onChange={(e) => setTypedSubcategory(e.target.value)}
            required
            autoFocus={selectedCategory === 'other'}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        ) : (
          <select
            name="subcategory"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {currentCategoryDropdownItems.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description / Item *
        </label>
        <input
          name="description"
          type="text"
          placeholder="e.g. Purchased items or service details"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        {state.fieldErrors?.description && (
          <p className="mt-1 text-xs text-rose-500">{state.fieldErrors.description[0]}</p>
        )}
      </div>

      {/* Amount & Date */}
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Receipt Snap & Barcode Scanner */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Receipt or Barcode (Optional)
        </span>

        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer flex items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg p-2.5 text-xs text-slate-600 dark:text-slate-300 transition text-center">
            <span>📷 Snap Receipt</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleReceiptCapture}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setShowBarcodeField(!showBarcodeField)}
            className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg p-2.5 text-xs text-slate-600 dark:text-slate-300 transition"
          >
            <span>🏷️ Barcode Entry</span>
          </button>
        </div>

        {receiptPreview && (
          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <Image
              src={receiptPreview}
              alt="Receipt Preview"
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 object-cover rounded"
            />
            <div className="text-xs">
              <p className="font-medium text-slate-800 dark:text-slate-200">Receipt Attached</p>
              <p className="text-[11px] text-slate-500">Scan status: Pending upload</p>
            </div>
            <button
              type="button"
              onClick={() => setReceiptPreview(null)}
              className="ml-auto text-xs text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {showBarcodeField && (
          <div>
            <input
              name="barcodeData"
              type="text"
              placeholder="Scan or paste barcode (e.g. 012345678905)"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}

        <input type="hidden" name="scanStatus" value={receiptPreview ? 'pending' : 'none'} />
        <input type="hidden" name="receiptImageUrl" value={receiptPreview || ''} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-medium text-sm transition shadow-sm"
      >
        {isPending ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
}