import { supabase } from '../services/supabase';
import { CategoryRow, UNCATEGORIZED } from '../services/catalog';

export async function getCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('category')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as unknown as CategoryRow[]) ?? [];
}

export async function createCategory(name: string): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from('category')
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data as CategoryRow;
}

export async function getOrCreateUncategorized(): Promise<CategoryRow> {
  const { data: uncategorized, error: uncatError } = await supabase
    .from('category')
    .select('*')
    .eq('name', UNCATEGORIZED)
    .maybeSingle();
  if (uncatError) throw uncatError;

  if (uncategorized) {
    return uncategorized as CategoryRow;
  }

  const insert = await supabase
    .from('category')
    .insert({ name: UNCATEGORIZED })
    .select()
    .single();
  if (insert.error) throw insert.error;
  return insert.data as CategoryRow;
}

export async function reassignProducts(
  categoryId: string,
  uncategorizedId: string,
): Promise<void> {
  const { error } = await supabase
    .from('product')
    .update({ category_id: uncategorizedId })
    .eq('category_id', categoryId);
  if (error) throw error;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from('category')
    .delete()
    .eq('category_id', categoryId);
  if (error) throw error;
}
