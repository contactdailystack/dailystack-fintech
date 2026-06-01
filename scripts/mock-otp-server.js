#!/usr/bin/env node
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map();

function generateCode(len){
  let c=''; for(let i=0;i<len;i++) c+=Math.floor(Math.random()*10).toString(); return c;
}

app.post('/api/send-otp', (req, res) => {
  const { email, length } = req.body || {};
  if(!email) return res.status(400).json({ message: 'Missing email' });
  const len = Number(length) || 6;
  const code = generateCode(len);
  const expiresAt = Date.now() + 120_000;
  otpStore.set(email, { code, expiresAt });
  console.log('[mock-otp] sent', email, code);
  res.json({ message: 'OTP sent (dev)', code, expiresIn: 120 });
});

app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body || {};
  if(!email || !code) return res.status(400).json({ message: 'Missing email or code' });
  const entry = otpStore.get(email);
  if(!entry) return res.status(400).json({ message: 'No code sent for this email' });
  if(Date.now() > entry.expiresAt) { otpStore.delete(email); return res.status(410).json({ message: 'Code expired' }); }
  if(entry.code !== String(code)) return res.status(401).json({ message: 'Invalid code' });
  otpStore.delete(email);
  res.json({ message: 'Verified' });
});

const port = process.env.PORT || 4444;
app.listen(port, () => console.log(`Mock OTP server running on http://localhost:${port}`));
