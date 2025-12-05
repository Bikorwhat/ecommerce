from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User


class Auth0Backend(BaseBackend):

    def authenticate(self, request, token=None):
        request.session["user"] = token
        user_info = token.get('userinfo')
        username = user_info.get('sub')

        if not username:
            raise ValueError('username can\'t be blank!')

        # The format of user_id is
        #    {identity provider id}|{unique id in the provider}
        # The pipe character is invalid for the django username field
        # The solution is to replace the pipe with a dash
        username = username.replace('|', '_')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Optionally you can add additional parameters when creating
            # the Django user like the name, role, administrative
            # priviledges and more. You can also opt to save the user into
            # the database on each login request, syncronizing the latest
            # changes done to the user in the Auth0 database
            user = User(username=username)
            user.save()

        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None