import { NextResponse } from 'next/server';
import { releaseEscrow } from '@/lib/solana';
import { getPayoutByIdempotencyKey, createPayout } from '@/lib/store';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1. Check if payout already exists in idempotent store
  const existing = getPayoutByIdempotencyKey(id);
  if (existing) {
    return NextResponse.json({
      verificationId: id,
      amount: existing.amountInr,
      currency: 'INR',
      transactionSignature: existing.transactionSignature,
      explorerUrl: existing.explorerUrl,
      paymentMethod: existing.paymentMethod,
      isLive: existing.isLive,
      timestamp: existing.createdAt,
    });
  }

  // 2. Execute release via Solana module (live devnet keypair or DEMO_MODE fixture)
  const escrowRes = await releaseEscrow({
    verificationId: id,
    farmerWalletAddress: '7b3pu4js8YgC8opZWLx8BVW7TnTP77ruAzi7Ayms7iyM',
    amountInr: 500,
  });

  // 3. Record in store for idempotent future calls
  createPayout({
    verificationId: id,
    deviceId: 'dev-demo-farmer-01',
    idempotencyKey: id,
    amountInr: 500,
    transactionSignature: escrowRes.signature,
    explorerUrl: escrowRes.explorerUrl,
    paymentMethod: 'solana_wallet',
    isLive: escrowRes.isLive,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    verificationId: id,
    amount: 500,
    currency: 'INR',
    transactionSignature: escrowRes.signature,
    explorerUrl: escrowRes.explorerUrl,
    paymentMethod: 'solana_wallet',
    isLive: escrowRes.isLive,
    timestamp: new Date().toISOString(),
  });
}
