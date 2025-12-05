# 🚀 Complete Auth0 API Setup - Step by Step

## ❌ Current Issue

You're getting 401 error because:
- Your frontend `.env` has `VITE_AUTH0_AUDIENCE=https://shopping.com`
- Your backend `.env` has `AUTH0_AUDIENCE=https://shopping.com`
- **BUT** you haven't created this API in Auth0 Dashboard yet!
- So Auth0 rejects tokens with this audience

## ✅ Solution: Create API in Auth0

### **Step 1: Go to Auth0 Dashboard**

1. Open https://manage.auth0.com in your browser
2. Login with your Auth0 account
3. Make sure you're in the right tenant: `dev-csffvmbg2hzm6jyq`

### **Step 2: Navigate to APIs**

1. In the left sidebar, click **Applications** → **APIs**
2. OR directly click the **APIs** option in the left menu

### **Step 3: Create New API**

1. Click the **Create API** button (top right)
2. A dialog will appear. Fill in:

   | Field | Value |
   |-------|-------|
   | Name | `Billing API` (or `Shopping API`) |
   | Identifier | `https://shopping.com` |
   | Signing Algorithm | `RS256` |

3. Click **Create**

**Important:** The **Identifier** MUST match exactly what's in your `.env` files!

### **Step 4: Configure the API**

After creating the API:

1. Click on your newly created API
2. Go to the **Settings** tab
3. Verify:
   - **Identifier:** `https://shopping.com` ✓
   - **Signing Algorithm:** `RS256` ✓

4. Go to the **Access Control** tab (if available)
5. Keep default settings

### **Step 5: Verify Your App Has Access**

1. Go back to **Applications** → **Applications**
2. Click on your app (the one with ID: `t2iqVbagMAWZlqOAMwSpDCzAMkjsBXLb`)
3. Go to **APIs** tab
4. Check if your new API appears in the list
5. If not, add it:
   - Click **Authorize**
   - Search for your API
   - Click **Authorize**

### **Step 6: Update Your Settings (if needed)**

Your `.env` files should already have the correct audience. Verify:

**`backend/.env`:**
```properties
AUTH0_AUDIENCE=https://shopping.com
```

**`frontend/.env`:**
```properties
VITE_AUTH0_AUDIENCE=https://shopping.com
```

---

## 🧪 Testing After Setup

### **1. Clear Everything**

```powershell
# Clear frontend cache
# Press F12 in browser → Application tab → Local Storage → Clear All

# Clear browser cookies
# Settings → Privacy → Cookies → Clear All

# Close browser completely
```

### **2. Restart Servers**

```powershell
# Terminal 1: Backend
cd c:\Users\Acer\Desktop\Billing\backend
python manage.py runserver

# Terminal 2: Frontend (new terminal)
cd c:\Users\Acer\Desktop\Billing\frontend
npm run dev
```

### **3. Test the Flow**

1. Go to http://localhost:5173
2. Click **Login** button
3. Complete Auth0 login
4. Return to app
5. Click **Buy Now** on a product
6. **Should redirect to Khalti** ✓ (not show 401 error)

---

## 🔍 Troubleshooting

### Still Getting 401?

**Check 1: Verify API was created**
- Go to Auth0 Dashboard → APIs
- Look for "Billing API" or "Shopping API"
- Click it
- Check Identifier = `https://shopping.com`

**Check 2: Verify .env files match**
```
Backend AUTH0_AUDIENCE = https://shopping.com
Frontend VITE_AUTH0_AUDIENCE = https://shopping.com
```
Must be EXACTLY the same!

**Check 3: Restart servers**
- Stop backend (Ctrl+C)
- Stop frontend (Ctrl+C)
- Start backend again
- Start frontend again

**Check 4: Clear browser completely**
- Press Ctrl+Shift+Delete
- Select "All time"
- Check: Cookies, Cached images, Local Storage
- Click Clear Now
- Close and reopen browser

**Check 5: Check backend logs**
- Look at the terminal running `python manage.py runserver`
- Copy any error messages

### Still Not Working?

Open browser DevTools (F12):
1. Go to **Network** tab
2. Click the "Buy Now" button
3. Look for failed request to `/khalti/initiate/`
4. Click on it
5. Go to **Response** tab
6. Share the error message

---

## 📝 Quick Reference

| What | Where |
|------|-------|
| Create API | https://manage.auth0.com → APIs → Create API |
| Identifier | Must be: `https://shopping.com` |
| API Audience (Backend) | `backend/.env` → `AUTH0_AUDIENCE` |
| API Audience (Frontend) | `frontend/.env` → `VITE_AUTH0_AUDIENCE` |
| Backend Server | `python manage.py runserver` |
| Frontend Server | `npm run dev` |

---

## ✨ After It Works

Once the API is created and you can successfully purchase:

1. **Test payment flow:**
   - Add items to cart
   - Go to cart
   - Click "Proceed to Payment"
   - Should redirect to Khalti

2. **Test purchase history:**
   - Complete a test payment
   - Go to "Purchase History"
   - Should show your purchase

---

## 🔒 Security Reminder

Never share or commit:
- `.env` files
- `AUTH0_CLIENT_SECRET`
- `KHALTI_SECRET_KEY`

Always use environment variables for sensitive data!

