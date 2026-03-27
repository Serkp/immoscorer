import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const lead = await request.json()

    if (!process.env.RESEND_API_KEY) {
      console.log('NEW LEAD (no Resend key):', JSON.stringify(lead))
      return NextResponse.json({ sent: false, reason: 'no_api_key' })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY
    }

    // E-MAIL 1: An dich (info@parlak-invest.de) — der Lead mit allen Details
    const adminEmail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: 'ImmoScorer <onboarding@resend.dev>',
        to: 'info@parlak-invest.de',
        subject: 'Neue Finanzierungsanfrage — ' + (lead.propertyAddress || 'Ohne Objekt'),
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;padding:40px 0;"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e2e2e8;"><tr><td style="background-color:#1a1a2e;padding:24px 32px;text-align:center;"><span style="font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">&#9679; ImmoScorer — Neuer Lead</span></td></tr><tr><td style="padding:28px 32px;"><h2 style="font-family:Arial,sans-serif;font-size:18px;color:#1a1a2e;margin:0 0 20px 0;">Neue Finanzierungsanfrage</h2><table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;"><tr style="background-color:#f8f8fa;"><td style="font-weight:bold;color:#51545e;width:140px;">Name:</td><td style="color:#1a1a2e;">${lead.firstName || ''} ${lead.lastName || ''}</td></tr><tr><td style="font-weight:bold;color:#51545e;">E-Mail:</td><td><a href="mailto:${lead.email}" style="color:#6366f1;">${lead.email || 'k.A.'}</a></td></tr><tr style="background-color:#f8f8fa;"><td style="font-weight:bold;color:#51545e;">Telefon:</td><td><a href="tel:${lead.phone}" style="color:#6366f1;font-size:16px;font-weight:bold;">${lead.phone || 'k.A.'}</a></td></tr><tr><td style="font-weight:bold;color:#51545e;">Nachricht:</td><td style="color:#1a1a2e;">${lead.message || '—'}</td></tr></table>${lead.propertyAddress ? '<h3 style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a2e;margin:24px 0 12px 0;border-top:1px solid #e2e2e8;padding-top:20px;">Objektdaten</h3><table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;"><tr style="background-color:#f8f8fa;"><td style="font-weight:bold;color:#51545e;width:140px;">Adresse:</td><td style="color:#1a1a2e;">' + lead.propertyAddress + '</td></tr><tr><td style="font-weight:bold;color:#51545e;">Kaufpreis:</td><td style="color:#1a1a2e;">' + (lead.purchasePrice ? Number(lead.purchasePrice).toLocaleString('de-DE') + ' EUR' : 'k.A.') + '</td></tr><tr style="background-color:#f8f8fa;"><td style="font-weight:bold;color:#51545e;">Kaltmiete:</td><td style="color:#1a1a2e;">' + (lead.monthlyRent ? Number(lead.monthlyRent).toLocaleString('de-DE') + ' EUR/Mon.' : 'k.A.') + '</td></tr><tr><td style="font-weight:bold;color:#51545e;">Score:</td><td style="color:#1a1a2e;font-weight:bold;">' + (lead.score ? lead.score + '/100' : 'k.A.') + '</td></tr></table>' : ''}<p style="font-family:Arial,sans-serif;font-size:13px;color:#85859b;margin:24px 0 0 0;border-top:1px solid #e2e2e8;padding-top:16px;">Eingegangen: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p></td></tr></table></td></tr></table>`
      })
    })

    const adminResult = await adminEmail.json()
    if (!adminEmail.ok) console.error('Admin email error:', adminResult)

    // E-MAIL 2: An den Kunden — Bestätigung
    if (lead.email) {
      const customerEmail = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: 'ImmoScorer <onboarding@resend.dev>',
          to: lead.email,
          subject: 'Ihre Finanzierungsanfrage bei ImmoScorer',
          html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f7;padding:40px 0;"><tr><td align="center"><table width="520" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:8px;border:1px solid #e2e2e8;"><tr><td style="background-color:#1a1a2e;padding:24px 32px;text-align:center;"><span style="font-family:Arial,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">&#9679; ImmoScorer</span></td></tr><tr><td style="padding:32px;"><h1 style="font-family:Arial,sans-serif;font-size:20px;color:#1a1a2e;margin:0 0 20px 0;">Vielen Dank für Ihre Anfrage!</h1><p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#51545e;margin:0 0 16px 0;">Hallo ${lead.firstName || ''},</p><p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#51545e;margin:0 0 16px 0;">Ihre Finanzierungsanfrage ist bei uns eingegangen. Unser Experte wird sich innerhalb von 24 Stunden persönlich bei Ihnen melden.</p>${lead.propertyAddress ? '<table width="100%" cellpadding="8" cellspacing="0" border="0" style="font-family:Arial,sans-serif;font-size:14px;background-color:#f8f8fa;border-radius:6px;margin:20px 0;"><tr><td style="font-weight:bold;color:#51545e;">Ihr Objekt:</td><td style="color:#1a1a2e;">' + lead.propertyAddress + '</td></tr><tr><td style="font-weight:bold;color:#51545e;">Kaufpreis:</td><td style="color:#1a1a2e;">' + (lead.purchasePrice ? Number(lead.purchasePrice).toLocaleString('de-DE') + ' EUR' : 'k.A.') + '</td></tr></table>' : ''}<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#51545e;margin:0 0 16px 0;">Was Sie erwartet:</p><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:#51545e;margin:0 0 20px 0;">1. Persönlicher Anruf von unserem Finanzierungsexperten<br>2. Analyse Ihrer individuellen Finanzierungsmöglichkeiten<br>3. Vergleich von über 500 Bankpartnern<br>4. Unverbindliches Angebot innerhalb von 48 Stunden</p><p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#51545e;margin:0 0 8px 0;">Bei Fragen erreichen Sie uns jederzeit unter:</p><p style="font-family:Arial,sans-serif;font-size:15px;color:#6366f1;margin:0;"><a href="mailto:info@parlak-invest.de" style="color:#6366f1;">info@parlak-invest.de</a></p><p style="font-family:Arial,sans-serif;font-size:14px;color:#85859b;margin:24px 0 0 0;border-top:1px solid #e2e2e8;padding-top:16px;">Mit freundlichen Grüßen,<br><strong style="color:#1a1a2e;">Ihr ImmoScorer Team</strong></p></td></tr></table><table width="520" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:20px 32px;text-align:center;"><p style="font-family:Arial,sans-serif;font-size:12px;color:#a0a0b0;margin:0;">ImmoScorer — Immobilien intelligent bewerten</p></td></tr></table></td></tr></table>`
        })
      })

      const customerResult = await customerEmail.json()
      if (!customerEmail.ok) console.error('Customer email error:', customerResult)
    }

    return NextResponse.json({ sent: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Notify error:', error)
    return NextResponse.json({ sent: false, error: msg }, { status: 500 })
  }
}
