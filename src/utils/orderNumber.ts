const PADDING = 3;
const PADDING_LENGTH = 8;

export function formatOrderNumber(
  orderNumber?: number,
  transactionId?: string,
): string {
  if (orderNumber != null) {
    return `Order #${String(orderNumber).padStart(PADDING, '0')}`;
  }
  if (transactionId) {
    return `#${transactionId.replace(/-/g, '').substring(0, PADDING_LENGTH).toUpperCase()}`;
  }
  return 'Order #000';
}
