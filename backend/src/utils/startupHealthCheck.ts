import { validateEnv } from "../config/envConfig"
import { AIProviderFactory } from "../ai/providers/AIProviderFactory"
import { runFinancialEngineTests } from "../tests/financialEngine.test"
import { logger } from "./logger"

export const performStartupHealthCheck = async () => {
  logger.info("Performing NexSpend Startup Health Check...")

  const env = validateEnv()
  logger.info(`✓ Environment configuration validated (PORT: ${env.port}, ENV: ${env.nodeEnv})`)

  runFinancialEngineTests()
  logger.info("✓ Financial calculation unit tests verified successfully")

  const provider = AIProviderFactory.getProvider()
  const isHealthy = await provider.healthCheck()
  logger.info(`✓ AI Infrastructure initialized (Provider: ${provider.name}, Status: ${isHealthy ? "Active" : "Fallback"})`)

  logger.info("==================================================")
  logger.info("🚀 NexSpend Production Engine Ready!")
  logger.info("==================================================")
}
