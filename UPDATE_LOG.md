# Saikat ERP Update Log - March 4, 2026

### 1. Login & Security Fixes
- **Issue:** Login cookies were not persisting on non-HTTPS connections.
- **Fix:** Updated `main.py` to use a dynamic `secure` flag for cookies. It now only sets `secure=True` if the request is via HTTPS, ensuring compatibility with local development and shared hosting without SSL.
- **Shared Hosting:** Updated server to listen on `0.0.0.0` instead of `127.0.0.1` for external access.

### 2. Photo Upload & Path Fixes
- **Issue:** Product photo upload was failing due to an undefined variable `UPLOADS_DIR` in the backend.
- **Fix:** 
  - Defined `UPLOADS_DIR` using absolute paths relative to the script location.
  - Fixed the image saving logic in `create_product` endpoint.
  - Ensured `uploads/` and `data/` directories are automatically created if missing.
  - Updated all file paths (Database, Uploads, Static files) to use absolute paths for robust performance on shared hosting (cPanel).

### 3. UI/UX Improvements (Native Popup Replacement)
- **Issue:** Some actions were using old browser-native `confirm()` popups.
- **Fix:**
  - Added `ConfirmDialog` (Styled Radix UI) for **Logout** in the Sidebar.
  - Added `ConfirmDialog` for **Clear Cart** in the Sales page.
  - Verified and ensured all "Delete" and "Reset" actions use the custom `ConfirmDialog` instead of browser defaults.

### 4. Shared Hosting Compatibility (cPanel)
- The system is now fully optimized for shared hosting:
  - Absolute path resolution for all assets and database.
  - Configurable host/port.
  - Dynamic cookie security.
  - Python-based backend (FastAPI) compatible with cPanel's "Setup Python App".

### 5. Final Build & Deployment
- Ran `npm run build` to generate the latest production-ready frontend assets in the `dist/` directory.
- Pushed all changes to the GitHub repository.

---
*Updated by Gemini CLI*
