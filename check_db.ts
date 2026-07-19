import 'dotenv/config';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    console.log('Connecting to:', process.env.DATABASE_URL?.split('@')[1]); // Log host only
    await prisma.$connect()
    console.log('Database connected!');
    const users = await prisma.user.count()
    console.log(`Found ${users} users`)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('Database connection failed:', message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
