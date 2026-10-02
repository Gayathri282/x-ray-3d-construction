# PawCare — Veterinary Online Consultation (MERN Demo)

A single-veterinary-doctor MERN demo with:
- React + Vite client
- Express + MongoDB/Mongoose server
- Socket.IO signalling/chat
- Browser WebRTC video consultation
- Demo Razorpay payment mode (real credentials can be added later)
- Doctor availability with 30/45 minute appointment types
- Booking, rescheduling, cancellation
- Appointment chat only after a paid booking
- Pet document uploads
- Prescription creation and delivery into appointment chat
- Consultation completion/uncompletion controls
- Patient and doctor consultation history

## Run

### 1. Start MongoDB
Use local MongoDB or MongoDB Atlas.

### 2. Server
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

### 3. Client
```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

Demo accounts:
- Doctor: doctor@pawcare.demo / doctor123
- Patient: patient@pawcare.demo / patient123

## Demo payment
The checkout is intentionally mocked so the project works before Razorpay credentials exist.
When ready, set:
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
and replace the demo order endpoint with the real Razorpay order creation/verification flow.

## Important production decisions
1. Never trust the browser for payment success. Verify Razorpay signatures on the server.
2. Add transaction/atomic protection around slot booking to prevent race-condition double booking.
3. Store uploaded medical files in object storage, not MongoDB/local disk.
4. Add HTTPS because camera/microphone access requires a secure context in production.
5. Use TURN in addition to STUN for reliable WebRTC across restrictive networks.
6. Do not automatically mark an appointment completed purely because a call lasted 10–15 minutes. Keep doctor confirmation as the authoritative completion action.
7. Define cancellation, refund, no-show and rescheduling rules before taking real payments.
8. Add audit logs for prescriptions and medical-record access.
