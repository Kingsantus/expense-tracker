'use server';

import db from '../../utils/index';
import { expense } from '../../db/schema';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../../lib/constants/expenses';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, {
    error: 'Invalid category selected',
  }),
  subcategory: z.string().trim().min(1, 'Subcategory is required'),
  description: z.string().trim().min(2, 'Description must be at least 2 characters'),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g., 45.50)')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than zero'),
  date: z.string().min(1, 'Date is required'),
  receiptImageUrl: z.string().url().optional().or(z.literal('')),
  barcodeData: z.string().trim().optional().or(z.literal('')),
  scanStatus: z.enum(['pending', 'completed', 'failed', 'none']).default('none'),
});

export type ExpenseActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createExpenseAction(
  userId: string,
  prevState: ExpenseActionState,
  formData: FormData
): Promise<ExpenseActionState> {
  const rawData = {
    category: formData.get('category'),
    subcategory: formData.get('subcategory'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    receiptImageUrl: formData.get('receiptImageUrl') || '',
    barcodeData: formData.get('barcodeData') || '',
    scanStatus: formData.get('scanStatus') || 'none',
  };

  const parsed = createExpenseSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: 'Please correct the issues in the form.',
    };
  }

  try {
    await db.insert(expense).values({
      userId,
      category: parsed.data.category as ExpenseCategory,
      subcategory: parsed.data.subcategory,
      description: parsed.data.description,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      receiptImageUrl: parsed.data.receiptImageUrl || null,
      barcodeData: parsed.data.barcodeData || null,
      scanStatus: parsed.data.scanStatus,
      ocrMetadata: parsed.data.receiptImageUrl ? { uploadedAt: new Date().toISOString() } : null,
    });

    revalidatePath('/expense');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Failed to create expense record:', err);
    return { error: 'Failed to record expense. Please try again.' };
  }
}

export async function deleteExpenseAction(userId: string, expenseId: string) {
  try {
    await db
      .delete(expense)
      .where(and(eq(expense.id, expenseId), eq(expense.userId, userId)));

    revalidatePath('/expense');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete expense:', err);
    return { error: 'Could not delete entry.' };
  }
}