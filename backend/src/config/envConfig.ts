import dotenv from "dotenv"

dotenv.config()

export interface EnvConfig {
  port: number
  nodeEnv: string
  jwtSecret: string
  clientUrl: string
  mongodbUri: string
  firebaseProjectId?: string
  firebaseClientEmail?: string
  firebasePrivateKey?: string
  firebaseStorageBucket?: string
  aiProvider: string
  openaiApiKey?: string
  geminiApiKey?: string
  claudeApiKey?: string
}

export const validateEnv = (): EnvConfig => {
  const port = parseInt(process.env.PORT || "5000", 10)
  const nodeEnv = process.env.NODE_ENV || "development"
  const jwtSecret = process.env.JWT_SECRET || "nexspend-production-jwt-secret-key"
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/nexspend"

  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
  const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
  const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET

  const aiProvider = (process.env.AI_PROVIDER || "openai").toLowerCase()
  const openaiApiKey = process.env.OPENAI_API_KEY
  const geminiApiKey = process.env.GEMINI_API_KEY
  const claudeApiKey = process.env.CLAUDE_API_KEY

  if (!["openai", "gemini", "claude"].includes(aiProvider)) {
    throw new Error(`Invalid AI_PROVIDER '${aiProvider}'. Must be 'openai', 'gemini', or 'claude'.`)
  }

  return {
    port,
    nodeEnv,
    jwtSecret,
    clientUrl,
    mongodbUri,
    firebaseProjectId,
    firebaseClientEmail,
    firebasePrivateKey,
    firebaseStorageBucket,
    aiProvider,
    openaiApiKey,
    geminiApiKey,
    claudeApiKey,
  }
}
