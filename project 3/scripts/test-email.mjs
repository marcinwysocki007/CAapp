import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.de',
  port: 587,
  secure: false,
  auth: {
    user: 'kostenrechner@primundus.de',
    pass: 'ticpab-jiHpyg-nubma6',
  },
});

const testEmail = {
  from: {
    name: 'Primundus 24h-Pflege',
    address: 'kostenrechner@primundus.de',
  },
  to: 'kostenrechner@primundus.de',
  subject: 'Test-E-Mail - SMTP-Konfiguration',
  text: 'Dies ist eine Test-E-Mail, um die SMTP-Verbindung zu testen.',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .success { background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Test-E-Mail</h1>
      <div class="success">
        <strong>✓ SMTP-Verbindung erfolgreich!</strong><br>
        Die E-Mail-Konfiguration funktioniert korrekt.
      </div>
      <p>Dies ist eine Test-E-Mail von Ihrem Primundus Kostenrechner.</p>
      <p>Wenn Sie diese E-Mail erhalten haben, ist die SMTP-Konfiguration korrekt eingerichtet.</p>
    </body>
    </html>
  `,
};

console.log('📧 Sende Test-E-Mail...');
console.log('Von:', testEmail.from.address);
console.log('An:', testEmail.to);
console.log('Betreff:', testEmail.subject);
console.log('');

try {
  const info = await transporter.sendMail(testEmail);
  console.log('✅ E-Mail erfolgreich versendet!');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
  console.log('');
  console.log('🎉 SMTP-Konfiguration funktioniert!');
} catch (error) {
  console.error('❌ Fehler beim E-Mail-Versand:', error);
  console.error('');
  console.error('Mögliche Ursachen:');
  console.error('- Falsche SMTP-Zugangsdaten');
  console.error('- SMTP-Server nicht erreichbar');
  console.error('- Firewall blockiert Port 587');
}
