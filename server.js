import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware with higher limit for image uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve vendor three.js library
app.get('/vendor/three.module.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/three/build/three.module.js'));
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Rate limiting in-memory map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

// Cleanup old rate limit entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 15 * 60 * 1000);

// In-memory inquiry storage (for safe logging and verification)
const inquiries = [];

// Helper: Setup Nodemailer Transporter if SMTP configured
function getSmtpTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

// Avatar Upload API Endpoint: saves khayoon.png directly to assets
app.post('/api/upload-avatar', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'No image data provided.' });
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid image data.' });
    }

    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const targetPng = path.join(assetsDir, 'khayoon.png');
    const targetJpg = path.join(assetsDir, 'Khayoon.jpg');

    fs.writeFileSync(targetPng, buffer);
    fs.writeFileSync(targetJpg, buffer);

    console.log(`[AVATAR UPDATED] Successfully wrote ${buffer.length} bytes to ${targetPng}`);
    return res.status(200).json({
      success: true,
      message: 'Profile portrait successfully saved and updated.',
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Error saving avatar:', err);
    return res.status(500).json({ success: false, error: 'Failed to save avatar on server.' });
  }
});

// Contact API endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // 1. Rate Limiting
    const now = Date.now();
    const rateData = rateLimitMap.get(clientIp) || { count: 0, startTime: now };
    if (now - rateData.startTime > RATE_LIMIT_WINDOW_MS) {
      rateData.count = 1;
      rateData.startTime = now;
    } else {
      rateData.count += 1;
    }
    rateLimitMap.set(clientIp, rateData);

    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        error: 'Too many messages sent. Please wait a few minutes before trying again.'
      });
    }

    const { name, email, subject, message, website } = req.body;

    // 2. Honeypot check (anti-spam)
    if (website && website.trim().length > 0) {
      // Quietly return success to fool spam bots
      return res.status(200).json({
        success: true,
        message: 'Your message has been received successfully.'
      });
    }

    // 3. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid name (2–100 characters).'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim()) || email.trim().length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 3000) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message between 10 and 3,000 characters.'
      });
    }

    const sanitizedName = name.trim().replace(/[<>]/g, '');
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSubject = (subject && typeof subject === 'string')
      ? subject.trim().replace(/[<>]/g, '').slice(0, 150)
      : 'New Portfolio Inquiry';
    const sanitizedMessage = message.trim().replace(/[<>]/g, '');

    const referenceId = 'INQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = new Date().toISOString();

    // The recipient email
    const recipientEmail = process.env.CONTACT_EMAIL || 'Khion2002@gmail.com';

    let deliveryMethod = 'client_dispatch';
    let deliveredViaServer = false;

    // 4. Try sending via SMTP (nodemailer) if configured
    const transporter = getSmtpTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
          to: recipientEmail,
          replyTo: sanitizedEmail,
          subject: `[Portfolio Inquiry] ${sanitizedSubject} - from ${sanitizedName}`,
          text: `Reference ID: ${referenceId}\nDate: ${timestamp}\nFrom: ${sanitizedName} <${sanitizedEmail}>\nSubject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="margin-top: 0; color: #111;">New Portfolio Contact Message</h2>
              <p><strong>Reference ID:</strong> ${referenceId}</p>
              <p><strong>From:</strong> ${sanitizedName} (<a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a>)</p>
              <p><strong>Subject:</strong> ${sanitizedSubject}</p>
              <p><strong>Date:</strong> ${timestamp}</p>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
              <div style="white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage}</div>
            </div>
          `
        });
        deliveryMethod = 'smtp';
        deliveredViaServer = true;
      } catch (smtpErr) {
        console.error('SMTP sending error:', smtpErr.message);
      }
    }

    // 5. Try sending via Resend if API key is configured and not yet delivered
    if (!deliveredViaServer && process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>',
            to: [recipientEmail],
            reply_to: sanitizedEmail,
            subject: `[Portfolio Inquiry] ${sanitizedSubject} - from ${sanitizedName}`,
            text: `Reference ID: ${referenceId}\nDate: ${timestamp}\nFrom: ${sanitizedName} <${sanitizedEmail}>\nSubject: ${sanitizedSubject}\n\nMessage:\n${sanitizedMessage}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; border: 1px solid #eaeaea; border-radius: 8px;">
                <h2 style="margin-top: 0; color: #111;">New Portfolio Contact Message</h2>
                <p><strong>Reference ID:</strong> ${referenceId}</p>
                <p><strong>From:</strong> ${sanitizedName} (<a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a>)</p>
                <p><strong>Subject:</strong> ${sanitizedSubject}</p>
                <p><strong>Date:</strong> ${timestamp}</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                <div style="white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage}</div>
              </div>
            `
          })
        });

        if (resendResponse.ok) {
          deliveryMethod = 'resend_api';
          deliveredViaServer = true;
        } else {
          console.warn('Resend delivery failed with status:', resendResponse.status);
        }
      } catch (mailErr) {
        console.error('Error forwarding via Resend:', mailErr.message);
      }
    }

    // Prepare direct client mail links for immediate dispatch
    const mailBody = `Hello Khayoon,\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nReference: ${referenceId}\n\n${sanitizedMessage}\n\n---\nSent via portfolio contact conduit`;
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(sanitizedSubject)}&body=${encodeURIComponent(mailBody)}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipientEmail}&su=${encodeURIComponent(sanitizedSubject)}&body=${encodeURIComponent(mailBody)}`;

    // Log the inquiry securely on the server
    const inquiryRecord = {
      referenceId,
      timestamp,
      senderName: sanitizedName,
      senderEmail: sanitizedEmail,
      subject: sanitizedSubject,
      messageLength: sanitizedMessage.length,
      deliveredViaServer,
      deliveryMethod
    };
    inquiries.push(inquiryRecord);
    console.log(`[CONTACT RECEIVED] Ref: ${referenceId} from ${sanitizedName} (${sanitizedEmail}) | Delivered: ${deliveredViaServer} via ${deliveryMethod}`);

    return res.status(200).json({
      success: true,
      deliveredViaServer,
      deliveryMethod,
      referenceId,
      recipientEmail,
      mailtoUrl,
      gmailUrl,
      message: deliveredViaServer
        ? 'Thank you! Your message has been securely sent to Khayoon Alaayedi. You will receive a response shortly.'
        : 'Your message has been logged. Use the button below to open and send directly via Gmail or your mail application to Khayoon Alaayedi.'
    });

  } catch (err) {
    console.error('Contact endpoint error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback to index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
