#!/usr/bin/env node
/**
 * deploy-razorpay.mjs
 * 
 * Run this script to deploy Razorpay Edge Functions to Supabase.
 * 
 * Prerequisites:
 *   1. Get your Supabase Access Token from:
 *      https://supabase.com/dashboard/account/tokens
 *   2. Set it as an environment variable:
 *      $env:SUPABASE_ACCESS_TOKEN = "sbp_xxxxxxxx"   (PowerShell)
 *   3. Then run: node deploy-razorpay.mjs
 */

const PROJECT_REF = 'rjrwpulvystjkcfeldpk'
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_T1QwIAO7zPg4bx'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'XJHgqVEv6v8K3k53Gjfz3VNV'

import { execSync } from 'child_process'

const token = process.env.SUPABASE_ACCESS_TOKEN
if (!token) {
  console.error('❌ SUPABASE_ACCESS_TOKEN not set!')
  console.error('')
  console.error('Steps:')
  console.error('  1. Go to: https://supabase.com/dashboard/account/tokens')
  console.error('  2. Generate a new token (name it "CLI Deploy")')
  console.error('  3. Run in PowerShell: $env:SUPABASE_ACCESS_TOKEN = "your-token-here"')
  console.error('  4. Run this script again: node deploy-razorpay.mjs')
  process.exit(1)
}

function run(cmd) {
  console.log(`\n▶ ${cmd}`)
  try {
    execSync(cmd, { stdio: 'inherit', env: { ...process.env } })
  } catch (e) {
    console.error(`❌ Command failed: ${cmd}`)
    process.exit(1)
  }
}

console.log('🚀 Deploying Razorpay Edge Functions to Supabase...')
console.log(`   Project: ${PROJECT_REF}`)

// Deploy both Edge Functions
run(`npx supabase functions deploy create-razorpay-order --project-ref ${PROJECT_REF}`)
run(`npx supabase functions deploy verify-razorpay-payment --project-ref ${PROJECT_REF}`)

// Set secrets (Key Secret stays server-side only)
console.log('\n🔐 Setting Supabase secrets (Key Secret stays server-side)...')
run(`npx supabase secrets set RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID} --project-ref ${PROJECT_REF}`)
run(`npx supabase secrets set RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET} --project-ref ${PROJECT_REF}`)

console.log('\n✅ All done!')
console.log('   Edge Functions deployed:')
console.log('   → create-razorpay-order')
console.log('   → verify-razorpay-payment')
console.log('')
console.log('🧪 Test the payment flow on your website.')
console.log('   Use Razorpay test card: 4111 1111 1111 1111')
console.log('   CVV: any 3 digits | Expiry: any future date')
