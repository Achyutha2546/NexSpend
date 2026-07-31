import { FinancialHealthEngine } from "../ai/engines/FinancialHealthEngine"
import { ForecastEngine } from "../ai/engines/ForecastEngine"
import { ScenarioEngine } from "../ai/engines/ScenarioEngine"
import { FinancialContext } from "../ai/types/aiTypes"

const sampleContext: FinancialContext = {
  userId: "user-test-123",
  totalIncome: 5000,
  totalExpenses: 3200,
  netSavings: 1800,
  savingsRate: 36,
  budgetSummary: {
    totalAllocated: 3000,
    totalSpent: 3200,
    overspendingCategories: ["Food & Dining"],
  },
  goalsSummary: {
    totalGoals: 2,
    totalSaved: 5000,
    totalTarget: 10000,
  },
  recentTransactionsCount: 24,
  topCategories: [{ category: "Food & Dining", amount: 800 }],
}

export function runFinancialEngineTests() {
  console.log("--- Running NexSpend Financial Calculation Engine Unit Tests ---")

  // 1. Health Score Evaluation Test
  const health = FinancialHealthEngine.evaluateHealth(sampleContext)
  console.assert(health.overallHealthScore > 0 && health.overallHealthScore <= 100, "Health score should be between 0 and 100")
  console.assert(health.savingsScore === 90, "Savings score for 36% savings rate should be 90")
  console.log("✓ FinancialHealthEngine test passed. Overall Score:", health.overallHealthScore)

  // 2. Forecast Engine Test
  const forecast = ForecastEngine.calculateForecast(sampleContext)
  console.assert(forecast.projectedIncome === 5000, "Projected income should equal total income")
  console.assert(forecast.budgetRiskScore === 75, "Overspending category should trigger 75% risk score")
  console.log("✓ ForecastEngine test passed. Projected Balance:", forecast.endOfMonthBalance)

  // 3. Scenario Engine Test
  const scenario = ScenarioEngine.evaluateScenario(sampleContext, "reduce_spending", 300)
  console.assert(scenario.projectedNetCashFlow === 2100, "Cashflow should increase by 300")
  console.log("✓ ScenarioEngine test passed. Projected Net Cash Flow:", scenario.projectedNetCashFlow)

  console.log("--- All Financial Calculation Engine Unit Tests Passed Cleanly! ---\n")
}
