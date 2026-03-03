# Saikat Machinery Manager

A secure inventory and billing management system for Messrs. Saikat Machinery.

## Features

- **Inventory Management:** Add, edit, delete products. Low stock alerts.
- **Sales (POS):** Search products, add to cart, checkout with customer details.
- **Memos:** View and print invoices.
- **Due Book:** Track customer dues and record payments.
- **Dashboard:** Overview of sales, dues, and low stock items.
- **Authentication:** Secure login for admin.

## Setup Instructions

### 1. Firebase Setup

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  Enable **Authentication** and set up **Email/Password** provider.
4.  Create an admin user manually in the Authentication tab (since there is no public sign-up).
5.  Enable **Firestore Database** in test mode or production mode.
6.  Go to Project Settings -> General -> Your apps -> Web app.
7.  Copy the Firebase configuration keys.

### 2. Environment Variables

Create a `.env` file in the root directory and add your Firebase keys:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Rules

Copy the contents of `firestore.rules` to your Firestore Rules tab in the Firebase Console to secure your database.

## Deployment

To deploy to Vercel:

1.  Push the code to GitHub.
2.  Import the project in Vercel.
3.  Add the environment variables in Vercel project settings.
4.  Deploy.

## Usage

1.  Login with the admin credentials created in Firebase.
2.  Go to **Inventory** to add products.
3.  Go to **Sales** to create new sales.
4.  Go to **Memos** to print invoices.
5.  Go to **Due Book** to manage customer payments.
