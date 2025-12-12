# Quick Fix for Existing Purchase Records

Since your existing purchase records have empty `user_sub` and `user_email` fields, you have two options:

## Option 1: Delete Old Records (Simplest)

If the existing purchases are just test data, delete them from Django admin:

1. Go to: `https://ecommerce-2as4.onrender.com/admin/khalti/purchasehistory/`
2. Select all records
3. Delete them
4. Make a new test purchase
5. It will now be saved with proper user information

## Option 2: Update Records Manually (If you want to keep them)

Run this in Django shell on Render:

```python
from khalti.models import PurchaseHistory

# Update all records with empty user_sub
# Replace 'your_username' with your actual Auth0 username
PurchaseHistory.objects.filter(user_sub__isnull=True).update(
    user_sub='your_username',
    user_email='your_email@example.com',
    user_name='Your Name'
)
```

## What Was Fixed

**Before**: `user_sub = getattr(user, 'id', None)` → Often returned `None`

**After**: `user_sub = getattr(user, 'sub', None) or getattr(user, 'id', None) or user.username`
- Tries Auth0 'sub' field first
- Falls back to 'id'
- Finally uses username as last resort

## Next Steps

1. Deploy the backend changes
2. Either delete old records OR update them manually
3. Make a new test purchase
4. Check purchase history - should now show your purchases!
