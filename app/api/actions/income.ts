'use server';

import db from '../../utils/index';
import { income } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const incomeTypes = ['salary', 'workmanship', 'parent', 'other'] as const;

const createIncomeSchema = z.object({
  sourceName: z.string().trim().min(2, 'Source name must be at least 2 characters'),
  type: z.enum(incomeTypes, { message: 'Invalid income type' }),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid monetary amount (e.g., 250.00)')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than zero'),
  date: z.string().min(1, 'Please select a date'),
  notes: z.string().trim().optional(),
});

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createIncomeAction(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    sourceName: formData.get('sourceName'),
    type: formData.get('type'),
    amount: formData.get('amount'),
    date: formData.get('date'),
    notes: formData.get('notes') || undefined,
  };

  const validated = createIncomeSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
      error: 'Please fix the errors in the form.',
    };
  }

  try {
    await db.insert(income).values({
      userId,
      sourceName: validated.data.sourceName,
      type: validated.data.type,
      amount: validated.data.amount,
      date: new Date(validated.data.date),
      notes: validated.data.notes || null,
    });

    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Failed to create income entry:', err);
    return { error: 'Failed to record income. Please try again.' };
  }
}

export async function deleteIncomeAction(userId: string, incomeId: string): Promise<ActionState> {
  try {
    await db
      .delete(income)
      .where(and(eq(income.id, incomeId), eq(income.userId, userId)));

    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    console.error('Failed to delete income entry:', err);
    return { error: 'Failed to delete record.' };
  }
}