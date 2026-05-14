import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "BarberOS <onboarding@resend.dev>";

let _client: Resend | null = null;
function client() {
  if (!apiKey) return null;
  if (!_client) _client = new Resend(apiKey);
  return _client;
}

async function send({ to, subject, html }: { to: string; subject: string; html: string }) {
  const c = client();
  if (!c) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { skipped: true };
  }
  try {
    const r = await c.emails.send({ from: FROM, to, subject, html });
    return { ok: true, id: r.data?.id };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: String(err) };
  }
}

function shell(content: string) {
  return `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;padding:32px;margin:0;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.06);">
      <div style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:24px;">BarberOS</div>
      ${content}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <div style="font-size:12px;color:#94a3b8;">Recebeu por engano? Ignore este email.</div>
    </div>
  </body></html>`;
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
}

export async function sendWelcomeEmail({ to, name, businessName }: { to: string; name?: string | null; businessName: string }) {
  const html = shell(`
    <h1 style="font-size:24px;color:#0f172a;margin:0 0 16px;">Bem-vindo${name ? `, ${name}` : ""} 👋</h1>
    <p style="color:#475569;line-height:1.6;">Sua barbearia <strong>${businessName}</strong> foi criada com sucesso no BarberOS. Agora você pode cadastrar serviços, profissionais e começar a receber agendamentos online.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Abrir BarberOS</a>
  `);
  return send({ to, subject: `Bem-vindo ao BarberOS · ${businessName}`, html });
}

export async function sendBookingConfirmation({ to, customerName, businessName, service, professional, when, priceCents }: {
  to: string; customerName: string; businessName: string; service: string; professional: string; when: Date; priceCents: number;
}) {
  const price = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);
  const html = shell(`
    <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">Agendamento confirmado ✅</h1>
    <p style="color:#475569;line-height:1.6;">Olá ${customerName}, seu horário em <strong>${businessName}</strong> está confirmado.</p>
    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Serviço</span><strong style="color:#0f172a;">${service}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Profissional</span><strong style="color:#0f172a;">${professional}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Quando</span><strong style="color:#0f172a;text-transform:capitalize;">${fmtDateTime(when)}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Valor</span><strong style="color:#0f172a;">${price}</strong></div>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin-top:16px;">Em caso de imprevisto, entre em contato com a barbearia.</p>
  `);
  return send({ to, subject: `Agendamento confirmado · ${businessName}`, html });
}

export async function sendBookingReminder({ to, customerName, businessName, service, professional, when }: {
  to: string; customerName: string; businessName: string; service: string; professional: string; when: Date;
}) {
  const html = shell(`
    <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">Lembrete: seu horário é em breve ⏰</h1>
    <p style="color:#475569;line-height:1.6;">Olá ${customerName}, esse é um lembrete amistoso do seu agendamento em <strong>${businessName}</strong>.</p>
    <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Serviço</span><strong style="color:#0f172a;">${service}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Profissional</span><strong style="color:#0f172a;">${professional}</strong></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;color:#475569;"><span>Quando</span><strong style="color:#0f172a;text-transform:capitalize;">${fmtDateTime(when)}</strong></div>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin-top:16px;">Te esperamos!</p>
  `);
  return send({ to, subject: `Lembrete · ${businessName}`, html });
}
