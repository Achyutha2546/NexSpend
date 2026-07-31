import { FinancialContext, ScenarioResult } from "../types/aiTypes"

export class ScenarioEngine {
  static evaluateScenario(
    context: FinancialContext,
    type: "increase_income" | "reduce_spending" | "cancel_subscription",
    deltaAmount: number
  ): ScenarioResult {
    const originalNetCashFlow = context.totalIncome - context.totalExpenses
    let projectedNetCashFlow = originalNetCashFlow

    let scenarioName = "Custom Scenario"
    let impactSummary = ""

    if (type === "increase_income") {
      scenarioName = `Income Increase (+₹${deltaAmount})`
      projectedNetCashFlow += deltaAmount
      impactSummary = `Boosting income by ₹${deltaAmount} increases monthly savings margin to ₹${projectedNetCashFlow.toFixed(2)}.`
    } else if (type === "reduce_spending" || type === "cancel_subscription") {
      scenarioName = `Expense Cut (-₹${deltaAmount})`
      projectedNetCashFlow += deltaAmount
      impactSummary = `Reducing expenses by ₹${deltaAmount} frees up ₹${deltaAmount} monthly toward savings goals.`
    }

    return {
      scenarioName,
      originalNetCashFlow,
      projectedNetCashFlow,
      deltaAmount,
      impactSummary,
    }
  }
}
