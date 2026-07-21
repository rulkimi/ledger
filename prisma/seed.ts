import 'dotenv/config'
import { BillingFrequency } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'
import prisma from '../src/lib/prisma'

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      subscriptions: {
        create: [
          {
            name: 'Netflix',
            cost: 15.99,
            billingFrequency: BillingFrequency.MONTHLY,
            startDate: new Date('2023-01-15'),
            category: 'Entertainment'
          },
          {
            name: 'Gym Membership',
            cost: 600.00,
            billingFrequency: BillingFrequency.YEARLY,
            startDate: new Date('2023-05-01'),
            category: 'Health'
          },
          {
            name: 'Spotify',
            cost: 10.99,
            billingFrequency: BillingFrequency.MONTHLY,
            startDate: new Date('2023-08-10'),
            category: 'Entertainment'
          },
          {
            name: 'AWS Hosting',
            cost: 25.50,
            billingFrequency: BillingFrequency.MONTHLY,
            startDate: new Date('2023-11-20'),
            category: 'Technology'
          },
          {
            name: 'Car Insurance',
            cost: 450.00,
            billingFrequency: BillingFrequency.BI_ANNUALLY,
            startDate: new Date('2024-02-15'),
            category: 'Auto'
          },
          {
            name: 'Amazon Prime',
            cost: 139.00,
            billingFrequency: BillingFrequency.YEARLY,
            startDate: new Date('2022-07-12'),
            category: 'Shopping'
          },
          {
            name: 'Weekly Meal Prep',
            cost: 120.00,
            billingFrequency: BillingFrequency.WEEKLY,
            startDate: new Date('2024-06-01'),
            category: 'Food'
          },
          {
            name: 'Internet Bill',
            cost: 79.99,
            billingFrequency: BillingFrequency.MONTHLY,
            startDate: new Date('2023-03-01'),
            category: 'Utilities'
          }
        ]
      }
    }
  })

  console.log('Demo user seeded with subscriptions:')
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
