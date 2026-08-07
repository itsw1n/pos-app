import * as Print from 'expo-print';

export async function printReceipt(html: string): Promise<void> {
  await Print.printAsync({ html });
}
