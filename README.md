# MindGuard AI

An AI-powered mental wellness application designed to help users monitor emotional well-being, access supportive resources, and encourage healthier daily habits through an intuitive mobile experience.

---

## Overview

MindGuard AI is a mobile application developed to promote mental wellness using artificial intelligence and modern mobile technologies. The application provides users with an interactive platform to better understand their emotional health while maintaining a simple, accessible, and user-friendly experience.

Built using React Native and a scalable backend architecture, MindGuard AI demonstrates full-stack mobile development, API integration, and AI-assisted healthcare concepts.

---

## Features

- AI-powered mental wellness assistance
- Interactive chatbot support
- Mood tracking and monitoring
- Daily wellness journaling
- Mental health resources
- Secure user authentication
- Cross-platform mobile application
- Backend API integration
- Responsive and intuitive user interface

---

## Tech Stack

### Mobile Application

- React Native
- Expo
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MongoDB

### Tools

- Git
- GitHub
- VS Code
- Postman

---

## Project Structure

```text
MindGuard-AI/
│
├── app/
├── assets/
├── backend/
├── components/
├── constants/
├── hooks/
├── screens/
├── services/
├── scripts/
├── app.js
├── package.json
└── README.md
```

---

## Running locally

```bash
git clone https://github.com/Dikshitha-Rasineni/MindGuard-AI.git
cd MindGuard-AI
npm install
cp backend/.env.example backend/.env     # put your MongoDB URI and a JWT secret in it
npm run seed:demo                        # demo@mindguard.app / mindguard-demo with 14 days of data
npm run api                              # backend on http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run web   # web app, or `npm start` for Expo Go
```

For Expo Go on a phone, set `EXPO_PUBLIC_API_URL` to your laptop's LAN address (e.g. `http://192.168.1.5:3000`)
or to the hosted API (`https://<your-app>.vercel.app/api`).

## Deployment (Vercel)

The web app and the API deploy together as one Vercel project: `npx expo export -p web` builds the site into `dist/`,
and `api/index.js` runs the Express backend as a serverless function under `/api` (see `vercel.json`).

1. Create a free MongoDB Atlas cluster. In **Network Access** allow `0.0.0.0/0` (Vercel has no fixed IP).
2. Import the repo in Vercel (root directory: repo root, no framework preset).
3. Add environment variables `MONGO_URI` and `JWT_SECRET`, then deploy.
4. Run `npm run seed:demo` locally with the same `MONGO_URI` in `backend/.env` to create the demo account.

## Accounts and passwords

- New users can sign up from the **Create Account** tab on the login screen.
- Demo login (after seeding): `demo@mindguard.app` / `mindguard-demo` (change with `DEMO_PASSWORD=...`).
- Forgot a password? Passwords are hashed and can't be recovered, but you can set a new one:
  `npm run reset-password -- you@example.com newPassword123` (uses `MONGO_URI` from `backend/.env`).
  If the email isn't found, the script lists the accounts that exist.

---

## Application Workflow

1. User registers or logs in securely.
2. The application provides access to wellness tools.
3. Users can track moods and maintain daily journals.
4. AI-assisted features provide supportive interactions.
5. Data is managed through backend APIs and securely stored.

---

## Objectives

- Promote awareness of mental wellness.
- Provide accessible AI-assisted support.
- Encourage healthy daily habits.
- Demonstrate modern full-stack mobile application development.
- Build a scalable healthcare-focused application.

---

## Future Improvements

- Personalized AI recommendations
- Voice-based chatbot support
- Emotion detection using facial expressions
- Therapist appointment integration
- Emergency SOS feature
- Wearable device integration
- Daily wellness reminders
- Analytics dashboard
- Cloud deployment

---

## Learning Outcomes

This project strengthened my understanding of:

- React Native mobile development
- Backend API development
- Database integration
- Full-stack application architecture
- Authentication and security
- AI-assisted application design
- Git and GitHub collaboration

---

## Achievement

MindGuard AI was developed as part of a hackathon project, showcasing rapid problem-solving, teamwork, and end-to-end application development within a limited timeframe.

---

## Author

**Dikshitha Rasineni**

B.Tech Computer Science and Engineering (AI & ML)

SRM Institute of Science and Technology

GitHub: https://github.com/Dikshitha-Rasineni

---

## License

This project is licensed under the MIT License.
