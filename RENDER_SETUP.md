# Render Deployment Setup

## Issue Fixed
The admin login redirect loop was caused by improper session cookie configuration for HTTPS in production.

## Changes Made

### 1. Updated `backend/settings.py`
- Changed `DEBUG` to read from environment variable (defaults to `True` for local development)
- Set `SESSION_COOKIE_SECURE = not DEBUG` (enables secure cookies on HTTPS in production)
- Set `CSRF_COOKIE_SECURE = not DEBUG` (enables secure CSRF cookies on HTTPS)
- Added `CSRF_TRUSTED_ORIGINS = ['https://ecommerce-2as4.onrender.com']`
- Set `SESSION_ENGINE = 'django.contrib.sessions.backends.db'` for reliable database-backed sessions

### 2. Updated `backend/build.sh`
- Fixed superuser creation command to use `--noinput` flag
- Added `|| true` to prevent build failure if superuser already exists

## Render Environment Variables

You need to set the following environment variable in your Render dashboard:

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Add this environment variable:

```
DEBUG=False
```

**Important:** Without setting `DEBUG=False` on Render, the session cookies won't work properly with HTTPS.

## Optional Environment Variables

If you want to use a custom secret key in production (recommended):

```
SECRET_KEY=your-super-secret-key-here
```

## How to Deploy

1. Commit the changes:
   ```bash
   git add .
   git commit -m "Fix admin login session cookies for production"
   git push
   ```

2. Set `DEBUG=False` in Render environment variables

3. Render will automatically redeploy

4. After deployment, you should be able to log in to the admin panel successfully

## Creating Superuser on Render

If you need to create a superuser manually on Render:

1. Go to your Render service dashboard
2. Click on **Shell** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow the prompts to create your admin account

## Troubleshooting

If you still have login issues:

1. **Clear browser cookies** for the Render domain
2. **Check Render logs** to see if there are any database connection errors
3. **Verify DATABASE_URL** is properly set in Render environment variables
4. **Check that migrations ran successfully** during the build process
