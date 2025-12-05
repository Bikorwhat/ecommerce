import jwt
import requests
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions
from django.conf import settings
from functools import lru_cache


class Auth0JSONWebTokenAuthentication(authentication.BaseAuthentication):
    """
    Custom DRF authentication class that validates Auth0 JWT tokens.
    """
    
    @lru_cache(maxsize=1)
    def get_jwks(self):
        """
        Fetch the JSON Web Key Set (JWKS) from Auth0.
        Cached to avoid repeated requests.
        """
        jwks_url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
        try:
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Unable to fetch JWKS: {str(e)}")
    
    def get_signing_key(self, token):
        """
        Extract the signing key from JWKS based on the token's kid (key ID).
        """
        try:
            # Decode header without verification to get the key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
            
            if not kid:
                raise exceptions.AuthenticationFailed("Token missing 'kid' in header")
            
            # Get JWKS and find the matching key
            jwks = self.get_jwks()
            
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    return jwt.algorithms.RSAAlgorithm.from_jwk(key)
            
            raise exceptions.AuthenticationFailed("Unable to find matching key in JWKS")
            
        except jwt.DecodeError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token header: {str(e)}")
    
    def authenticate(self, request):
        """
        Authenticate the request by validating the JWT token.
        Returns (user, token) tuple or None.
        """
        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None  # No authentication attempted
        
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise exceptions.AuthenticationFailed('Invalid authorization header format. Expected: Bearer <token>')
        
        token = parts[1]
        
        try:
            # Get the signing key
            signing_key = self.get_signing_key(token)
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=['RS256'],
                audience=settings.AUTH0_AUDIENCE,
                issuer=f"https://{settings.AUTH0_DOMAIN}/"
            )
            
            # Extract user information from token
            user_sub = payload.get('sub')  # Auth0 user ID (e.g., "google-oauth2|123456")
            
            if not user_sub:
                raise exceptions.AuthenticationFailed("Token missing 'sub' claim")
            
            # Get or create Django user
            user = self.get_or_create_user(payload)
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidAudienceError:
            raise exceptions.AuthenticationFailed('Invalid token audience')
        except jwt.InvalidIssuerError:
            raise exceptions.AuthenticationFailed('Invalid token issuer')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def get_or_create_user(self, payload):
        """
        Get or create a Django user from the JWT payload.
        """
        user_sub = payload.get('sub')
        
        # Replace pipe character with underscore for Django username
        username = user_sub.replace('|', '_')
        
        # Try to get existing user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=payload.get('email', ''),
                first_name=payload.get('given_name', ''),
                last_name=payload.get('family_name', '')
            )
        
        # Store additional user info as attributes (not saved to DB)
        user.auth0_sub = user_sub
        user.email = payload.get('email', user.email)
        user.name = payload.get('name', f"{user.first_name} {user.last_name}".strip())
        
        return user
