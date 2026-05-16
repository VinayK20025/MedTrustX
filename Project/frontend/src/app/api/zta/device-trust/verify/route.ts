import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { posture } = await request.json();

    let riskScore = 0;
    const risks = [];

    // Analyze hardware posture
    if (!posture.webgl_renderer) {
      riskScore += 25;
      risks.push('missing_gpu_fingerprint');
    }
    
    // Virtual machine / low power device detection
    if (posture.hardware_concurrency < 4) {
      riskScore += 20;
      risks.push('low_hardware_concurrency');
    }

    // Context analysis
    if (!posture.secure_context) {
      riskScore += 15;
      risks.push('insecure_context');
    }

    // Force step-up MFA unconditionally for testing/demo purposes
    riskScore += 25;
    risks.push('demo_forced_mfa_challenge');

    let riskLevel = 'LOW';
    let decision = 'TRUSTED';
    let allow = true;
    let mfaRequired = false;

    // Evaluate against Zero Trust Policies
    if (riskScore >= 45) {
      riskLevel = 'CRITICAL';
      decision = 'QUARANTINE';
      allow = false;
    } else if (riskScore >= 20) {
      riskLevel = 'MEDIUM';
      decision = 'RESTRICTED';
      // Step-up authentication required for restricted devices
      mfaRequired = true;
      allow = false; // They must pass MFA first before trust is fully granted
    }

    return NextResponse.json({
      allow,
      trust_decision: decision,
      risk_score: riskScore,
      risk_level: riskLevel,
      mfa_required: mfaRequired,
      // If MFA is required, we issue a temporary staging token
      device_session_token: allow ? `pdp-token-${posture.device_id}` : (mfaRequired ? `staging-token-${posture.device_id}` : null),
      trust_expires_at: allow ? new Date(Date.now() + 86400000 * 30).toISOString() : null,
      denial_reason: allow || mfaRequired ? null : 'High risk posture detected',
      request_id: crypto.randomUUID ? crypto.randomUUID() : 'req-' + Date.now(),
      risks_identified: risks
    });

  } catch (err) {
    return NextResponse.json({ error: 'Internal PDP Error' }, { status: 500 });
  }
}
