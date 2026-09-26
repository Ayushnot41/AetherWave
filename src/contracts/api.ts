import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums & Primitives
// ---------------------------------------------------------------------------

export const RiskLevelSchema = z.enum(['none', 'elevated', 'critical']).describe(
  'Severity classification of a risk node in the swarm graph',
);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/**
 * BCP-47-style dialect codes the platform currently supports.
 * Kept as a union rather than a free string so the compiler catches typos.
 */
export const DialectCodeSchema = z
  .enum([
    'hi-IN',
    'en-IN',
    'mr-IN',
    'ta-IN',
    'te-IN',
    'kn-IN',
    'bn-IN',
    'gu-IN',
    'pa-IN',
    'ml-IN',
    'or-IN',
    'as-IN',
  ])
  .describe('BCP-47 dialect code for UI localisation and TTS voice selection');
export type DialectCode = z.infer<typeof DialectCodeSchema>;

// ---------------------------------------------------------------------------
// Pipeline Step Status (shared across verification steps)
// ---------------------------------------------------------------------------

export const PipelineStepStatusSchema = z
  .enum(['pending', 'processing', 'success', 'failed'])
  .describe('Current state of a single verification pipeline step');
export type PipelineStepStatus = z.infer<typeof PipelineStepStatusSchema>;

export const PipelineStepSchema = z.object({
  status: PipelineStepStatusSchema,
  failureReason: z
    .string()
    .describe('Human-readable failure reason when status is "failed"')
    .optional(),
});
export type PipelineStep = z.infer<typeof PipelineStepSchema>;

export const GeminiAuditResultSchema = z.object({
  isCropImage: z.boolean().describe('False if the image is not identifiable as agricultural/crop content'),
  cropStressLevel: z.number().min(0).max(10).describe('0 = healthy, 10 = total crop loss'),
  immediateRiskFactor: z.string().min(1).describe('Single sentence naming the dominant visible risk'),
  recommendedMicroAction: z.string().min(1).describe('Single sentence, concrete, low-cost intervention'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
});
export type GeminiAuditResult = z.infer<typeof GeminiAuditResultSchema>;

export const GeminiPipelineStepSchema = PipelineStepSchema.extend({
  result: GeminiAuditResultSchema.optional(),
  retryable: z.boolean().optional().describe('Whether the failure is transient and can be retried'),
});
export type GeminiPipelineStep = z.infer<typeof GeminiPipelineStepSchema>;

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export const TelemetryPayloadSchema = z.object({
  gps: z.object({
    latitude: z.number().min(-90).max(90).describe('WGS-84 latitude in decimal degrees'),
    longitude: z.number().min(-180).max(180).describe('WGS-84 longitude in decimal degrees'),
    accuracy: z.number().nonnegative().describe('Horizontal accuracy of the GPS fix in metres'),
    altitude: z
      .number()
      .describe('Altitude above WGS-84 ellipsoid in metres')
      .nullable(),
  }),
  gyroscope: z.object({
    alpha: z.number().describe('Device rotation around the Z axis in degrees (0–360)'),
    beta: z.number().describe('Device rotation around the X axis in degrees (-180–180)'),
    gamma: z.number().describe('Device rotation around the Y axis in degrees (-90–90)'),
  }),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .describe('ISO-8601 timestamp with timezone offset of when the telemetry was captured'),
  deviceId: z
    .string()
    .min(1)
    .describe('Stable device fingerprint identifier for fraud detection'),
});
export type TelemetryPayload = z.infer<typeof TelemetryPayloadSchema>;

// ---------------------------------------------------------------------------
// Auth – Passwordless OTP
// ---------------------------------------------------------------------------

export const AuthOtpRequestSchema = z.object({
  phone: z
    .string()
    .min(10)
    .describe('Phone number to receive the OTP'),
  dialect: DialectCodeSchema.optional().default('hi-IN').describe('Preferred dialect for the OTP voice/SMS message'),
});
export type AuthOtpRequest = z.infer<typeof AuthOtpRequestSchema>;

export const AuthOtpResponseSchema = z.object({
  requestId: z.string().min(1).describe('Server-generated request ID to correlate the OTP flow'),
  expiresAt: z
    .string()
    .describe('ISO-8601 timestamp after which the OTP is no longer valid'),
  retryAfterSeconds: z
    .number()
    .int()
    .nonnegative()
    .describe('Minimum seconds before the client may request a new OTP'),
});
export type AuthOtpResponse = z.infer<typeof AuthOtpResponseSchema>;

export const AuthOtpVerifySchema = z.object({
  requestId: z.string().min(1).describe('The requestId or phone identifier returned from the OTP request call'),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/)
    .describe('Six-digit one-time password entered by the user'),
});
export type AuthOtpVerify = z.infer<typeof AuthOtpVerifySchema>;

export const AuthOtpVerifyResponseSchema = z.object({
  accessToken: z.string().min(1).describe('Short-lived JWT access token for API authorisation'),
  expiresAt: z
    .string()
    .describe('ISO-8601 timestamp when the access token expires'),
});
export type AuthOtpVerifyResponse = z.infer<typeof AuthOtpVerifyResponseSchema>;

// ---------------------------------------------------------------------------
// Intake – Multimodal Capture Submission
// ---------------------------------------------------------------------------

export const IntakeSubmissionSchema = z.object({
  imageBlobRef: z
    .string()
    .min(1)
    .describe('Cloud storage reference key for the uploaded photo capture'),
  audioBlobRef: z
    .string()
    .min(1)
    .describe('Cloud storage reference key for the uploaded audio narration')
    .nullable(),
  telemetry: TelemetryPayloadSchema.describe(
    'Device telemetry snapshot captured at the moment of submission',
  ),
  dialect: DialectCodeSchema.describe('Dialect spoken in the audio narration'),
});
export type IntakeSubmission = z.infer<typeof IntakeSubmissionSchema>;

export const IntakeSubmissionResponseSchema = z.object({
  submissionId: z
    .string()
    .uuid()
    .describe('Unique identifier for this intake submission'),
  status: z
    .enum(['queued', 'processing'])
    .describe('Initial processing status after submission'),
  estimatedWaitSeconds: z
    .number()
    .int()
    .nonnegative()
    .describe('Estimated seconds until swarm analysis completes'),
});
export type IntakeSubmissionResponse = z.infer<typeof IntakeSubmissionResponseSchema>;

// ---------------------------------------------------------------------------
// Swarm – Cascading Risk Graph Result
// ---------------------------------------------------------------------------

const RiskNodeSchema = z.object({
  riskLevel: RiskLevelSchema.describe('Assessed risk severity for this dimension'),
  summary: z
    .string()
    .min(1)
    .describe('Localised human-readable summary of the assessed risk'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Model confidence score between 0 (no confidence) and 1 (full confidence)'),
});

export const SwarmResultSchema = z.object({
  submissionId: z
    .string()
    .uuid()
    .describe('The intake submission this result belongs to'),
  analysedAt: z
    .string()
    .datetime({ offset: true })
    .describe('ISO-8601 timestamp when swarm analysis completed'),
  nodes: z.object({
    climate: RiskNodeSchema.describe(
      'Climate risk assessment — drought, flood, heatwave, storm likelihood',
    ),
    health: RiskNodeSchema.describe(
      'Health risk assessment — waterborne disease, vector risk, air quality',
    ),
    livelihood: RiskNodeSchema.describe(
      'Livelihood risk assessment — crop loss, market access, income disruption',
    ),
  }),
  overallRisk: RiskLevelSchema.describe(
    'Highest risk level across all three nodes, used for triage',
  ),
});
export type SwarmResult = z.infer<typeof SwarmResultSchema>;

// ---------------------------------------------------------------------------
// Recommended Action
// ---------------------------------------------------------------------------

export const RecommendedActionSchema = z.object({
  actionId: z.string().uuid().describe('Unique identifier for this recommended action'),
  title: z.string().min(1).describe('Short, localised title of the recommended action'),
  description: z
    .string()
    .min(1)
    .describe('Detailed, localised description of what the user should do'),
  audioUrl: z
    .string()
    .url()
    .describe('URL to a TTS audio file explaining the action in the user dialect')
    .nullable(),
  imageUrl: z
    .string()
    .url()
    .describe('URL to an illustrative image for the action card')
    .nullable(),
  eligibleAmount: z
    .number()
    .nonnegative()
    .describe('Amount in local currency the user is eligible to claim upon verification')
    .nullable(),
});
export type RecommendedAction = z.infer<typeof RecommendedActionSchema>;

// ---------------------------------------------------------------------------
// Verification – Proof Submission
// ---------------------------------------------------------------------------

export const VerificationSubmissionSchema = z.object({
  actionId: z
    .string()
    .min(1)
    .describe('The recommended action being verified'),
  proofImageBlobRef: z
    .string()
    .min(1)
    .describe('Cloud storage reference key for the uploaded proof photograph'),
  proofImageBase64: z
    .string()
    .min(1)
    .describe('Base64-encoded JPEG of the captured proof photo, sent directly since no blob storage exists yet'),
  telemetry: TelemetryPayloadSchema.describe(
    'Device telemetry snapshot captured at the moment of proof submission',
  ),
});
export type VerificationSubmission = z.infer<typeof VerificationSubmissionSchema>;

export const VerificationSubmissionResponseSchema = z.object({
  verificationId: z
    .string()
    .min(1)
    .describe('Unique identifier for this verification attempt'),
  status: z
    .enum(['queued', 'processing'])
    .describe('Initial processing status of the verification'),
});
export type VerificationSubmissionResponse = z.infer<typeof VerificationSubmissionResponseSchema>;

// ---------------------------------------------------------------------------
// Verification – Pipeline Status
// ---------------------------------------------------------------------------

export const VerificationStatusSchema = z.object({
  verificationId: z.string().min(1).describe('Identifier of the verification being tracked'),
  steps: z.object({
    geminiValidation: GeminiPipelineStepSchema.describe(
      'Step 1 – Gemini Vision validates the proof photo against the action requirements',
    ),
    oracleCheck: PipelineStepSchema.describe(
      'Step 2 – External oracle cross-references real-world data (weather, market, health)',
    ),
    solanaMint: PipelineStepSchema.describe(
      'Step 3 – Solana on-chain proof-of-impact NFT is minted',
    ),
    escrowUnlock: PipelineStepSchema.describe(
      'Step 4 – Escrow funds are unlocked and queued for payout',
    ),
  }),
  updatedAt: z
    .string()
    .datetime({ offset: true })
    .describe('ISO-8601 timestamp of the most recent pipeline status change'),
});
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

// ---------------------------------------------------------------------------
// Payout
// ---------------------------------------------------------------------------

export const PayoutResultSchema = z.object({
  verificationId: z
    .string()
    .min(1)
    .describe('The verification that triggered this payout'),
  amount: z
    .number()
    .positive()
    .describe('Disbursed amount in local currency (₹500)'),
  currency: z.string().default('INR'),
  transactionSignature: z
    .string()
    .min(1)
    .describe('Solana transaction signature (base-58 encoded)'),
  explorerUrl: z
    .string()
    .url()
    .describe('URL to view the transaction on a Solana block explorer'),
  paymentMethod: z
    .string()
    .min(1)
    .describe('Disbursement rail used for payout'),
  isLive: z.boolean().optional(),
  timestamp: z
    .string()
    .describe('ISO-8601 timestamp when the payout was executed'),
});
export type PayoutResult = z.infer<typeof PayoutResultSchema>;

// ---------------------------------------------------------------------------
// API Error
// ---------------------------------------------------------------------------

export const ApiErrorSchema = z.object({
  code: z
    .string()
    .min(1)
    .describe('Machine-readable error code (e.g. "AUTH_EXPIRED", "RATE_LIMITED")'),
  message: z
    .string()
    .min(1)
    .describe('Human-readable error message suitable for display'),
  retryable: z
    .boolean()
    .describe('Whether the client should retry the request with exponential backoff'),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
