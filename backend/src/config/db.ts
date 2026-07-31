import mongoose from "mongoose"
import dns from "dns"

export const connectDB = async () => {
  try {
    // Use Google Public DNS to resolve MongoDB Atlas SRV records
    // (many home routers fail to resolve SRV DNS queries)
    dns.setServers(["8.8.8.8", "8.8.4.4"])

    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI
    if (!mongoURI) {
      console.warn("MONGODB_URI is not defined. Running in fallback mode.")
      return
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error: any) {
    console.warn("MongoDB Atlas Notice: Could not connect to Atlas cluster.", error.message)
  }
}
