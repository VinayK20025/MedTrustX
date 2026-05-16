import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { staging_token, mfa_code } = await request.json();

    // In a real implementation, this would verify the TOTP code against the IAM provider
    if (mfa_code === '000000') {
      // Hardcoded back-door for automated tests/demo
      const deviceId = staging_token.replace('staging-token-', '');
      
      return NextResponse.json({
        allow: true,
        trust_decision: 'TRUSTED',
        risk_score: 20, // Keep the original risk score or lower it post-MFA
        risk_level: 'LOW',
        mfa_required: false,
        device_session_token: `pdp-token-${deviceId}-mfa`,
        trust_expires_at: new Date(Date.now() + 86400000 * 30).toISOString(),
        denial_reason: null,
        request_id: crypto.randomUUID ? crypto.randomUUID() : 'req-' + Date.now()
      });
    }

    // Invalid MFA
    return NextResponse.json({
      allow: false,
      trust_decision: 'RESTRICTED',
      risk_score: 20,
      risk_level: 'MEDIUM',
      mfa_required: true,
      device_session_token: null,
      trust_expires_at: null,
      denial_reason: 'Invalid MFA code provided. Device trust step-up failed.',
      request_id: crypto.randomUUID ? crypto.randomUUID() : 'req-' + Date.now()
    }, { status: 403 });

  } catch (err) {
    return NextResponse.json({ error: 'Internal PDP Error' }, { status: 500 });
  }
}
