const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Configure your SMTP transport
// Replace these with your actual SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

app.post('/api/contact', async (req, res) => {
  const { fname, lname, email, company, service, message } = req.body;

  if (!fname || !lname || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const mailOptions = {
    from: `"Ktechify Website" <${process.env.SMTP_USER || 'noreply@ktechify.com'}>`,
    to: 'info@ktechify.com',
    replyTo: email,
    subject: `New enquiry from ${fname} ${lname}${service ? ' — ' + service : ''}`,
    text: [
      `Name: ${fname} ${lname}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      service ? `Service: ${service}` : null,
      ``,
      `Message:`,
      message,
    ].filter(Boolean).join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#1a56f0">New Enquiry — Ktechify Website</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#0a0c14">Name</td><td style="padding:8px;color:#6b7a99">${fname} ${lname}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#0a0c14">Email</td><td style="padding:8px;color:#6b7a99"><a href="mailto:${email}">${email}</a></td></tr>
          ${company ? `<tr><td style="padding:8px;font-weight:bold;color:#0a0c14">Company</td><td style="padding:8px;color:#6b7a99">${company}</td></tr>` : ''}
          ${service ? `<tr><td style="padding:8px;font-weight:bold;color:#0a0c14">Service</td><td style="padding:8px;color:#6b7a99">${service}</td></tr>` : ''}
        </table>
        <div style="margin-top:16px;padding:16px;background:#f8faff;border-radius:8px">
          <p style="margin:0;color:#0a0c14;white-space:pre-wrap">${message}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email send error:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Ktechify server running on http://localhost:${PORT}`);
});
