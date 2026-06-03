import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()
user = User.objects.first()
if user:
    print(f"Testing for user: {user.email}")
    token = default_token_generator.make_token(user)
    print(f"Generated token: {token}")
    is_valid = default_token_generator.check_token(user, token)
    print(f"Is valid immediately: {is_valid}")
else:
    print("No users found.")
