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
  const { data, error } = await supabase
    .from('category')
    .upsert({ name: UNCATEGORIZED }, { onConflict: 'name' })
    .select()
    .single();
  if (error) throw error;
  return data as CategoryRow;
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
