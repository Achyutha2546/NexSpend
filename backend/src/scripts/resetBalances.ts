import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { PaymentMethod } from "../models/PaymentMethod"
import { Category } from "../models/Category"
import { Transaction } from "../models/Transaction"

// Load env variables
dotenv.config({ path: path.join(__dirname, "../../.env") })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment")
  process.exit(1)
}

async function run() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI!)
    console.log("✓ Connected successfully!")

    // 1. Reset all Payment Method initial balances to 0
    console.log("Resetting all payment method initial amounts to 0...")
    const pmResult = await PaymentMethod.updateMany({}, { $set: { initialAmount: 0 } })
    console.log(`✓ Updated ${pmResult.modifiedCount} payment methods.`)

    // 2. Reset all Category initial balances to 0
    console.log("Resetting all category initial amounts to 0...")
    const catResult = await Category.updateMany({}, { $set: { initialAmount: 0 } })
    console.log(`✓ Updated ${catResult.modifiedCount} categories.`)

    // 3. Delete all initial balance transactions
    console.log("Deleting all Initial Balance transactions...")
    const txResult = await Transaction.deleteMany({
      title: { $regex: /Initial Balance$/ }
    })
    console.log(`✓ Deleted ${txResult.deletedCount} initial balance transactions.`)

    console.log("Database balances reset successfully!")
  } catch (error) {
    console.error("Error during reset:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB.")
  }
}

run()
