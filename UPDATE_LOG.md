# Saikat ERP Update Log - March 4, 2026 (Update 2)

### 1. Enhanced Logging System
- **Backend Logging:** Updated `main.py` with a robust logging configuration that saves all request info and errors to `app.log`.
- **Request Middleware:** Added middleware to log every HTTP request (Method, Path, Status, Duration).
- **Global Error Handler:** Added a global exception handler to catch and log any unhandled server errors, making debugging easier on shared hosting.

### 2. Due Book Improvements (Manual Entry)
- **Manual Due:** Added the ability to add "Old Due" or "Manual Due" for any customer without creating a sale.
- **New Customer Entry:** Added a dedicated "Add New Customer" button and dialog in the Due Book page for easier onboarding.
- **Table Actions:** Added "Manual Due" action button directly in the customer list table.

### 3. Sales Page Enhancements
- **Existing Customer Selector:** Added a searchable selector to choose from existing customers during checkout.
- **Real-time Balance Check:** When an existing customer is selected, their current due/advance balance is shown immediately.
- **Customer Mode Toggle:** Easily switch between "New Customer" and "Existing Customer" modes.
- **Backend Integration:** Updated the `/api/sales` endpoint to handle both new and existing customer IDs seamlessly.

### 4. Bug Fixes
- **Notification 404:** Fixed the `/api/notifications` endpoint which was previously returning a 404 error.
- **Customer Listing:** Customers are now sorted alphabetically for better navigation.

---
*Updated by Gemini CLI*
