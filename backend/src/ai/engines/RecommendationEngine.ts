import { FinancialContext, StructuredRecommendation } from "../types/aiTypes"

export class RecommendationEngine {
  static generateRecommendations(context: FinancialContext): StructuredRecommendation[] {
    const recommendations: StructuredRecommendation[] = []

    if (context.totalIncome === 0 && context.totalExpenses === 0) {
      recommendations.push({
        priority: "high",
        title: "Log Your First Transaction",
        description: "Your NexSpend account has no recorded income or expense transactions.",
        reason: "Adding transactions enables AI financial health scoring, forecasting, and automated budget tracking.",
        estimatedImpact: 0,
        confidence: 1.0,
        category: "Tracking",
        action: "Click 'Add Transaction' to record your cash flow",
      })
      return recommendations
    }

    if (context.savingsRate < 20) {
      recommendations.push({
        priority: "high",
        title: "Increase Monthly Savings Rate",
        description: `Your current savings rate is ${context.savingsRate}%. We recommend saving at least 20% of net income.`,
        reason: "Building an emergency buffer protects against unforeseen expenses.",
        estimatedImpact: Math.round(context.totalIncome * 0.1),
        confidence: 0.95,
        category: "Savings",
        action: "Set up auto-deposit to Emergency Fund",
      })
    }

    if (context.budgetSummary.overspendingCategories.length > 0) {
      recommendations.push({
        priority: "high",
        title: "Cap Overspending Categories",
        description: `You have exceeded budgets in ${context.budgetSummary.overspendingCategories.join(", ")}.`,
        reason: "Preventing overspending restores your target monthly cashflow balance.",
        estimatedImpact: 150,
        confidence: 0.9,
        category: "Budgeting",
        action: "Review category spending limits",
      })
    }

    if (context.goalsSummary.totalGoals === 0) {
      recommendations.push({
        priority: "medium",
        title: "Create Emergency Reserve Goal",
        description: "You have no active savings goals configured in NexSpend.",
        reason: "Goal-oriented saving increases completion probability by 40%.",
        estimatedImpact: 1000,
        confidence: 0.85,
        category: "Goals",
        action: "Create a new Emergency Goal",
      })
    }

    return recommendations
  }
}
