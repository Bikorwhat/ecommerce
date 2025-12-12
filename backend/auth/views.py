from django.http import HttpResponse
from django.shortcuts import render
from django.conf import settings
from authlib.integrations.django_client import OAuth
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import auth

# Create your views here.
oauth = OAuth()

oauth.register(
    "auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=(f"https://{settings.AUTH0_DOMAIN}/"+
        ".well-known/openid-configuration"),
    authorize_params={
        "audience": settings.AUTH0_AUDIENCE,  # Request JWT access token for API
    },
)

def callback(request):
    try:
        # Get the access token from Auth0
        token = oauth.auth0.authorize_access_token(request)
        
        # Extract the access token (JWT) and user info
        access_token = token.get('access_token')
        id_token = token.get('id_token')
        user_info = token.get('userinfo')
        
        print(f"User info from Auth0: {user_info}")
        
        if access_token and user_info:
            # Extract user details
            email = user_info.get('email', '')
            name = user_info.get('name', '')
            sub = user_info.get('sub', '')
            
            # Redirect to frontend with both token and user info
            # URL encode the parameters
            from urllib.parse import urlencode
            params = {
                'token': access_token,
                'email': email,
                'name': name,
                'sub': sub
            }
            frontend_url = f"{settings.FRONTEND_URL}/auth/callback?{urlencode(params)}"
            return redirect(frontend_url)
        
        return HttpResponse("Authentication failed - no token received", status=400)
    except Exception as e:
        print(f"Auth callback error: {e}")
        return HttpResponse(f"Authentication error: {str(e)}", status=400)

def login(request):
    return oauth.auth0.authorize_redirect(
        request,
        request.build_absolute_uri(reverse("callback")),
    )