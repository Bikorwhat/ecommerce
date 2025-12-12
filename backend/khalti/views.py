import json
import uuid
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PurchaseHistory

# ------------------------------------------------------------------
# 1. Initiate payment (called from React) - JWT PROTECTED
# ------------------------------------------------------------------
KHALTI_INITIATE_URL = "https://a.khalti.com/api/v2/epayment/initiate/"   # live URL
# For testing use: https://a.khalti.com/api/v2/epayment/initiate/
KHALTI_SECRET_KEY = "live_secret_key_68791341fdd94846a146f0457ff7b455"   # <-- keep this in env!

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def khalti_initiate(request):
    try:
        # Get authenticated user from JWT
        user = request.user
        print(f"User authenticated: {user.username}, Email: {getattr(user, 'email', 'N/A')}")
        
        data = request.data
        print(f"Received payload: {data}")
        
        amount = int(data["amount"]) * 100                # Khalti expects paisa
        if amount < 1000:  # Khalti minimum is Rs 10
            error_msg = f"Minimum amount is Rs 10. You tried to pay Rs {data['amount']}"
            print(f"Amount validation failed: {error_msg}")
            return Response({"error": error_msg}, status=400)
            
        purchase_order_id = str(data.get("purchase_order_id") or uuid.uuid4())
        purchase_order_name = data.get("purchase_order_name", "Order")
        items = data.get("items", [])  # Get items from request

        # Get user info from JWT token attributes (set by our authentication backend)
        user_name = getattr(user, 'name', None) or user.username
        user_email = getattr(user, 'email', None) or 'customer@example.com'
        
        payload = {
            "return_url": f"{settings.FRONTEND_URL}/payment/success",   # React page
            "website_url": settings.FRONTEND_URL,
            "amount": amount,
            "purchase_order_id": purchase_order_id,
            "purchase_order_name": purchase_order_name,
            "customer_info": {
                "name": user_name,
                "email": user_email,
                "phone": data.get("customer_phone", "9800000001")
            }
        }

        print(f"Sending to Khalti: {payload}")

        headers = {
            "Authorization": f"Key {KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        resp = requests.post(KHALTI_INITIATE_URL, json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        khalti_resp = resp.json()

        # Khalti returns: { "pidx": "...", "payment_url": "...", ... }
        return Response({
            "pidx": khalti_resp["pidx"],
            "payment_url": khalti_resp["payment_url"]
        })

    except Exception as e:
        print(f"Error in khalti_initiate: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=400)


# ------------------------------------------------------------------
# 2. Verify payment (Khalti will POST to this endpoint after payment) - JWT PROTECTED
# ------------------------------------------------------------------
KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/"

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def khalti_verify(request):
    try:
        # Get authenticated user from JWT
        user = request.user
        
        data = request.data
        pidx = data["pidx"]                     # sent by Khalti in return_url query
        items = data.get("items", [])           # Get items from request

        payload = {"pidx": pidx}
        headers = {
            "Authorization": f"Key {KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        resp = requests.post(KHALTI_LOOKUP_URL, json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        verification = resp.json()

        # verification["status"] == "Completed" means success
        if verification.get("status") == "Completed":
            # Get user identifier - use Auth0 sub, not Django user ID
            user_identifier = getattr(user, 'auth0_sub', None) or getattr(user, 'sub', None) or user.username
            user_email = getattr(user, 'email', '') or f"{user.username}@example.com"
            user_name = getattr(user, 'name', '') or user.username
            
            print(f"Saving purchase for user: {user_identifier}, email: {user_email}, name: {user_name}")
            
            # Save purchase history
            purchase = PurchaseHistory.objects.create(
                user_sub=user_identifier,
                user_email=user_email,
                user_name=user_name,
                total_amount=verification.get('total_amount', 0) / 100,  # Convert from paisa to Rs
                items=items,
                pidx=pidx,
                status=verification.get('status'),
                purchase_order_id=verification.get('purchase_order_id', '')
            )
            
            return Response({
                **verification,
                'purchase_id': purchase.id
            })
        
        return Response(verification)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ------------------------------------------------------------------
# 3. Get purchase history for authenticated user - JWT PROTECTED
# ------------------------------------------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchase_history(request):
    try:
        # Get authenticated user from JWT
        user = request.user
        # Use Auth0 sub, not Django user ID
        user_sub = getattr(user, 'auth0_sub', None) or getattr(user, 'sub', None) or user.username
        
        print(f"Fetching purchase history for user: {user_sub}")
        
        # Get all purchases for this user
        purchases = PurchaseHistory.objects.filter(user_sub=user_sub)
        
        print(f"Found {purchases.count()} purchases for user {user_sub}")
        
        # Serialize the data
        purchase_data = []
        for purchase in purchases:
            purchase_data.append({
                'id': purchase.id,
                'purchase_date': purchase.purchase_date.isoformat(),
                'total_amount': float(purchase.total_amount),
                'items': purchase.items,
                'status': purchase.status,
                'pidx': purchase.pidx,
                'purchase_order_id': purchase.purchase_order_id
            })
        
        return Response(purchase_data)
    
    except Exception as e:
        return Response({"error": str(e)}, status=400)