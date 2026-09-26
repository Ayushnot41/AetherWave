// Universal zero-dependency shim for Next.js builds
module.exports = {
  config: () => ({ parsed: {} }),
  parse: () => ({}),
  Connection: class {},
  Keypair: {
    fromSecretKey: () => ({ publicKey: { toBase58: () => 'Aeth1111111111111111111111111111111111111111' } }),
    generate: () => ({ publicKey: { toBase58: () => 'Aeth1111111111111111111111111111111111111111' } }),
  },
  PublicKey: class {
    constructor(k) { this.k = k; }
    toBase58() { return String(this.k); }
  },
  SystemProgram: { transfer: () => ({}) },
  Transaction: class { add() { return this; } },
  TransactionInstruction: class {},
  sendAndConfirmTransaction: async () => 'AethSimulatedSig58739281729381928371928371928371',
};
