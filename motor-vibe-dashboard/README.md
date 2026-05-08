# Motor Vibration Monitoring Dashboard

## Project Overview

This project is a **Motor Vibration Monitoring Dashboard** that displays real-time motor sensor data such as:

- Temperature
- Current
- Voltage
- Vibration

The dashboard reads **live data from Firebase Realtime Database**. Populate `motor01/logs` and/or `motor01/live_reading` using your own pipeline, scripts, or the Firebase console. See `FIREBASE_SCHEMA.md` at the repo root for the expected shape.

---

# Technologies Used

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Firebase Realtime Database

---

# Project Structure

```
project-root
│
├── motor-vibe-dashboard     # Frontend (React Dashboard)
│   ├── src
│   ├── package.json
│   └── vercel.json
│
└── FIREBASE_SCHEMA.md
```

---

# Running the Project Locally

## 1. Install Dependencies

Make sure you have:

- **Node.js**
- **npm**

Then run:

```bash
git clone <YOUR_GIT_REPOSITORY>

cd motor-vibe-dashboard

npm install
```

---

# 2. Setup Environment Variables

Create a `.env` file inside:

```
motor-vibe-dashboard/
```

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
```

You can get this from:

Firebase Console → Project Settings → Web App Configuration

---

# 3. Start the Frontend

Run:

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

# Firebase Data Structure

Example structure in Realtime Database:

```
motor01
   │
   ├── live_reading
   │      ├── temperature
   │      ├── current
   │      ├── voltage
   │      └── vibration
   │
   └── logs
```

More details are available in:

```
FIREBASE_SCHEMA.md
```

---

# Deployment

## Deploy on Vercel

1. Push the repository to **GitHub**

2. Go to:

```
https://vercel.com
```

3. Import your GitHub repository

4. Set **Root Directory**

```
motor-vibe-dashboard
```

---

# Add Environment Variables

Add these in Vercel:

### Firebase Client

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

---

# Features

- Real-time motor monitoring
- Firebase Realtime Database integration
- Live dashboard updates
- Predictive maintenance support

---

# License

This project is for educational and research purposes.
