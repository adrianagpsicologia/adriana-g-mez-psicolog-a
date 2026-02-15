import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "adriana@adrianagomezpsicologia.com";
const SITE_URL = "https://id-preview--f0cfe220-ceae-47fc-bfbc-dd8928153d84.lovable.app";

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f7f5f2;font-family:'Outfit',system-ui,sans-serif;color:#302b25;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(48,43,37,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#302b25;padding:32px 40px;text-align:center;">
              <h1 style="font-family:'Cormorant Garamond',Georgia,serif;color:#f7f5f2;font-size:28px;font-weight:500;margin:0;letter-spacing:-0.5px;">
                Adriana Gómez
              </h1>
              <p style="color:#d4c9b8;font-size:13px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">
                Psicología
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:500;margin:0 0 24px;color:#302b25;">
                ${title}
              </h2>
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:#f3efe9;text-align:center;border-top:1px solid #e8e2d9;">
              <p style="font-size:12px;color:#7a7268;margin:0;">
                Este email ha sido enviado automáticamente desde la plataforma de Adriana Gómez Psicología.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function bookingDetailBlock(serviceName: string, date: string, time: string, meetLink?: string, modifiedInfo?: string): string {
  let html = `
    <div style="background-color:#f3efe9;border-radius:12px;padding:24px;margin:20px 0;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:4px 0;">
            <span style="font-size:13px;color:#7a7268;">Servicio</span><br>
            <span style="font-size:15px;font-weight:500;">${serviceName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0 4px;">
            <span style="font-size:13px;color:#7a7268;">Fecha y hora</span><br>
            <span style="font-size:15px;font-weight:500;">${date} · ${time}</span>
          </td>
        </tr>`;

  if (modifiedInfo) {
    html += `
        <tr>
          <td style="padding:12px 0 4px;">
            <span style="font-size:13px;color:#b8860b;font-weight:500;">⚠ Modificación</span><br>
            <span style="font-size:14px;">${modifiedInfo}</span>
          </td>
        </tr>`;
  }

  if (meetLink) {
    html += `
        <tr>
          <td style="padding:16px 0 4px;">
            <a href="${meetLink}" style="display:inline-block;background-color:#302b25;color:#f7f5f2;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">
              📹 Unirse a la videollamada
            </a>
          </td>
        </tr>`;
  }

  html += `
      </table>
    </div>`;
  return html;
}

function buttonBlock(text: string, url: string): string {
  return `
    <div style="text-align:center;margin:28px 0 12px;">
      <a href="${url}" style="display:inline-block;background-color:#302b25;color:#f7f5f2;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:500;">
        ${text}
      </a>
    </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { type, patientEmail, userId, patientName, serviceName, date, time, meetLink, modifiedInfo, newDate, newTime } = await req.json();

    // Resolve patient email: use provided email or look up from auth
    let resolvedEmail = patientEmail;
    if (!resolvedEmail && userId) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      resolvedEmail = userData?.user?.email || null;
    }

    // admin_new_request goes to admin email, no patient email needed
    if (!resolvedEmail && type !== "admin_new_request") {
      throw new Error("No patient email available");
    }

    let to: string;
    let subject: string;
    let html: string;

    switch (type) {
      case "patient_request_sent": {
        // Email to patient: your request was sent
        to = resolvedEmail;
        subject = "Solicitud de sesión enviada";
        html = emailLayout(
          "Tu solicitud ha sido enviada",
          `<p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Hola ${patientName},
          </p>
          <p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Hemos recibido tu solicitud de sesión. Te enviaremos una confirmación en cuanto la revisemos.
          </p>
          ${bookingDetailBlock(serviceName, date, time)}
          <p style="font-size:14px;color:#7a7268;margin:16px 0 0;">
            Recibirás un email cuando tu cita sea confirmada.
          </p>`
        );
        break;
      }

      case "admin_new_request": {
        // Email to admin: new booking request
        to = ADMIN_EMAIL;
        subject = `Nueva solicitud: ${patientName} — ${serviceName}`;
        html = emailLayout(
          "Nueva solicitud de sesión",
          `<p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            <strong>${patientName}</strong> ha solicitado una sesión:
          </p>
          ${bookingDetailBlock(serviceName, date, time)}
          ${buttonBlock("Gestionar en el panel", SITE_URL + "/admin")}
          <p style="font-size:13px;color:#7a7268;text-align:center;margin:8px 0 0;">
            Puedes verificar, modificar o cancelar esta solicitud desde el panel de administración.
          </p>`
        );
        break;
      }

      case "patient_confirmed": {
        // Email to patient: booking confirmed with Meet link
        to = resolvedEmail;
        subject = "✅ Tu sesión ha sido confirmada";
        html = emailLayout(
          "Sesión confirmada",
          `<p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Hola ${patientName},
          </p>
          <p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Tu sesión ha sido confirmada. A continuación tienes los detalles y el enlace para la videollamada:
          </p>
          ${bookingDetailBlock(serviceName, date, time, meetLink)}
          <p style="font-size:14px;color:#7a7268;margin:16px 0 0;">
            Recuerda que puedes modificar o cancelar tu cita hasta 24 horas antes.
          </p>`
        );
        break;
      }

      case "patient_modified": {
        // Email to patient: booking modified
        to = resolvedEmail;
        subject = "📝 Tu sesión ha sido modificada";
        const modDetail = modifiedInfo || `Nueva fecha: ${newDate || date} · ${newTime || time}`;
        html = emailLayout(
          "Sesión modificada",
          `<p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Hola ${patientName},
          </p>
          <p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Tu sesión ha sido modificada. Estos son los nuevos detalles:
          </p>
          ${bookingDetailBlock(serviceName, newDate || date, newTime || time, meetLink, modDetail)}
          <p style="font-size:14px;color:#7a7268;margin:16px 0 0;">
            Si tienes alguna duda, no dudes en ponerte en contacto.
          </p>`
        );
        break;
      }

      case "patient_cancelled": {
        // Email to patient: booking cancelled
        to = resolvedEmail;
        subject = "❌ Tu sesión ha sido cancelada";
        html = emailLayout(
          "Sesión cancelada",
          `<p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Hola ${patientName},
          </p>
          <p style="font-size:15px;line-height:1.7;color:#504a42;margin:0 0 16px;">
            Lamentamos informarte de que tu sesión ha sido cancelada.
          </p>
          ${bookingDetailBlock(serviceName, date, time)}
          <p style="font-size:15px;line-height:1.7;color:#504a42;margin:16px 0 0;">
            Si deseas reservar una nueva cita, puedes hacerlo desde tu portal:
          </p>
          ${buttonBlock("Reservar nueva cita", SITE_URL + "/reservar")}`
        );
        break;
      }

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Adriana Gómez Psicología <noreply@adrianagomezpsicologia.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    console.log(`Email sent [${type}] to ${to}:`, resendData.id);

    return new Response(JSON.stringify({ success: true, emailId: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
