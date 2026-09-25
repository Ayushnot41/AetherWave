import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return NextResponse.json({
    verificationId: id,
    amount: 5.0,
    transactionSignature: '5xZKProofLightProtocolMint' + Math.random().toString(36).substring(2, 12) + 'SolanaDevnetSeal',
    explorerUrl: `https://explorer.solana.com/tx/5xZKProofLightProtocolMintSolanaDevnetSeal?cluster=devnet`,
    paymentMethod: 'UPI Instant Disbursal',
    timestamp: new Date().toISOString(),
  });
}
