import { paymentMethodService } from "./paymentMethodService";
import { transactionService } from "./transactionService";
import { categoryService } from "./categoryService";

/**
 * Resets all account balances to zero by:
 * 1. Setting all payment method initialAmounts to 0
 * 2. Setting all category initialAmounts to 0
 * 3. Deleting all transactions
 *
 * After this, the computed totalBalance will be 0.
 */
export async function resetAllBalances(): Promise<void> {
  // 1. Reset payment methods initialAmount to 0
  const paymentMethods = await paymentMethodService.getPaymentMethods();
  await Promise.all(
    paymentMethods.map((pm) =>
      paymentMethodService.updatePaymentMethod(pm._id!, { initialAmount: 0 })
    )
  );

  // 2. Reset category initialAmounts to 0
  const categories = await categoryService.getCategories();
  await Promise.all(
    categories.map((cat) =>
      categoryService.updateCategory(cat._id!, { initialAmount: 0 })
    )
  );

  // 3. Delete all transactions
  const { transactions } = await transactionService.getTransactions();
  if (Array.isArray(transactions)) {
    await Promise.all(transactions.map((tx) => transactionService.deleteTransaction(tx._id)));
  }
}
