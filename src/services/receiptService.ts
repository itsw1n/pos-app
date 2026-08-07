import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface ReceiptData {
  transaction_id: string;
  total_amount: number;
  payment_mode: string;
  date: string;
  items: Array<{ name: string; quantity: number; subtotal: number }>;
}

export async function generateReceipt(
  transaction: ReceiptData,
): Promise<string> {
  const html = `
    <html><body style="font-family: monospace; padding: 20px;">
      <h3>IPSS - Cafe Elvira</h3>
      <p>Transaction: ${transaction.transaction_id}</p>
      <p>Date: ${transaction.date}</p>
      <p>Payment: ${transaction.payment_mode}</p>
      <hr />
      ${transaction.items.map((i) => `<p>${i.name} x${i.quantity} = ${i.subtotal}</p>`).join('')}
      <hr />
      <p><strong>Total: ${transaction.total_amount}</strong></p>
    </body></html>
  `;
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function shareReceipt(uri: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) return;
  await Sharing.shareAsync(uri);
}
