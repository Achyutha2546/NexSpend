import { FinancialContext } from "../types/aiTypes"

export class PromptBuilder {
  static buildFinancialSummaryPrompt(context: FinancialContext): string {
    if (context.totalIncome === 0 && context.totalExpenses === 0) {
      return `
You are NexSpend AI, an elite financial advisor. The user currently has 0 recorded transactions in their NexSpend account.
Provide a concise, welcoming 2-bullet summary informing them that there is no transaction history recorded yet, and encouraging them to log their first income or expense transaction to unlock AI cashflow predictions and health analysis.
`
    }

    return `
You are NexSpend AI, an elite financial advisor. Analyze the following user financial metrics:

--- USER FINANCIAL METRICS ---
- Total Income: ₹${context.totalIncome.toFixed(2)}
- Total Expenses: ₹${context.totalExpenses.toFixed(2)}
- Net Savings: ₹${context.netSavings.toFixed(2)}
- Savings Rate: ${context.savingsRate}%
- Active Budgets Total: ₹${context.budgetSummary.totalAllocated.toFixed(2)} (Spent: ₹${context.budgetSummary.totalSpent.toFixed(2)})
- Overspending Categories: ${context.budgetSummary.overspendingCategories.join(", ") || "None"}
- Savings Goals Saved: ₹${context.goalsSummary.totalSaved.toFixed(2)} / ₹${context.goalsSummary.totalTarget.toFixed(2)}

Provide a concise, professional 3-bullet financial summary explaining these numbers.
`
  }

  static buildRecommendationPrompt(context: FinancialContext): string {
    return `
You are NexSpend AI. Based on the user's financial profile below, provide structured advice:

--- PROFILE ---
- Income: $${context.totalIncome}
- Expenses: $${context.totalExpenses}
- Savings Rate: ${context.savingsRate}%
- Overspending Categories: ${context.budgetSummary.overspendingCategories.join(", ") || "None"}

Generate actionable recommendations prioritizing emergency reserves and budget compliance.
`
  }

  static buildChatPrompt(userQuery: string, context: FinancialContext, history: string[] = []): string {
    return `
You are NexSpend AI Financial Assistant. Answer the user query using only verified financial context.

--- RECENT HISTORY ---
${history.slice(-4).join("\n")}

--- CURRENT USER CONTEXT ---
- Monthly Income: $${context.totalIncome}
- Monthly Expenses: $${context.totalExpenses}
- Savings Rate: ${context.savingsRate}%

--- USER QUERY ---
${userQuery}
`
  }
}
