
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.WHATSAPP_FROM;
const toNumber = process.env.WHATSAPP_TO || '+66926025572';

export async function sendWhatsappMessage(body: string) {
  if (!accountSid || !authToken || !fromNumber) return { ok: false };
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append('From', `whatsapp:${fromNumber}`);
  params.append('To', `whatsapp:${toNumber}`);
  params.append('Body', body);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  return { ok: res.ok };
}
