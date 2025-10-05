import nodemailer from 'nodemailer'
process.loadEnvFile('../.env')

// Variables requeridas (añadir al .env si no existen):
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM (opcional), FRONT_URL

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM
} = process.env

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] Faltan variables SMTP en .env. Servicio de correo inactivo.')
}

export const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
})

export async function sendMail({ to, subject, html }) {
    if (!SMTP_HOST) {
        throw new Error('Servicio de correo no configurado (faltan variables SMTP)')
    }
    const from = MAIL_FROM || `WorkHub <${SMTP_USER}>`
    return transporter.sendMail({ from, to, subject, html })
}

