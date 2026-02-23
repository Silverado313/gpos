# GPOS: Complete GitHub to Firebase Setup Guide

This guide provides the full end-to-end process for a new owner or developer to take this codebase from GitHub and host it live on Firebase.

---

## Part 1: Initial Local Setup

### 1. Clone the Code
First, the new owner needs to download the code from GitHub:
```bash
git clone https://github.com/Silverado313/gpos.git
cd gpos
```

### 2. Install Dependencies
Install all required libraries and tools:
```bash
npm install
```

### 3. Prepare Environment Variables
Create a real `.env` file from the example:
- Copy `env.example` and rename it to `.env`.
- Keep this file open; you'll fill it in the next part.

---

## Part 2: Firebase Project Configuration

### 1. Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add Project"** and follow the prompts.
3.  **Authentication**: In the left sidebar, go to **Build > Authentication** and enable **Email/Password**.
4.  **Firestore**: Go to **Build > Firestore Database** and click **Create Database**. 
    - Start in **Production Mode**.
    - Choose a region closest to your business.

### 2. Get the Secret API Keys
1.  In Firebase, click the ⚙️ icon (Project Settings).
2.  Under "Your apps", click the **Web icon (</>)** to register a new app.
3.  Copy the values from the `firebaseConfig` object into your `.env` file:
    ```env
    VITE_FIREBASE_API_KEY=xxx
    VITE_FIREBASE_AUTH_DOMAIN=xxx
    VITE_FIREBASE_PROJECT_ID=xxx
    VITE_FIREBASE_STORAGE_BUCKET=xxx
    VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
    VITE_FIREBASE_APP_ID=xxx
    ```

---

## Part 3: Building and Deploying

### 1. Install Firebase Tools (Global)
If you don't have the Firebase CLI:
```bash
npm install -g firebase-tools
```

### 2. Login and Connect
```bash
firebase login
firebase use --add
```
- Select your new Firebase project from the list.

### 3. Final Deployment
Run these commands to build the production site and push it live:
```bash
# Generate production files
npm run build

# Push to Firebase
firebase deploy --only hosting
```

### 4. Important: Set Security Rules
After deployment, go to your **Firestore Console > Rules** and ensure you have rules that protect your data. A basic rule for authenticated users is:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Part 4: Accessing the App
Once deployed, Firebase will provide a URL like `https://your-project.web.app`.
1.  Open the URL.
2.  Register a new account.
3.  **Note**: The first account is usually blocked by default for security. You must manually go to the Firestore **users** collection and set the `role` to `admin` so you can start managing the system.
