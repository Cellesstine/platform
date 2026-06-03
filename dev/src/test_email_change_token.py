import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.tokens import email_change_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

User = get_user_model()
user = User.objects.first()

if user:
    original_email = user.email
    original_pending = user.pending_email

    try:
        # 1. Simulate change email request
        user.pending_email = "new_test_email@gmail.com"
        user.save(update_fields=['pending_email'])
        
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_change_token_generator.make_token(user)
        print(f"Simulating request: Generated token {token} for user {user.email} (pending: {user.pending_email})")
        
        # 2. Simulate email verify callback (first request - fresh lookup from DB)
        uid = force_str(urlsafe_base64_decode(uidb64))
        user_lookup = User.objects.get(pk=uid)
        is_valid_1 = email_change_token_generator.check_token(user_lookup, token)
        print(f"Checking token from first DB lookup: {is_valid_1}")
        
        if is_valid_1 and user_lookup.pending_email:
            user_lookup.email = user_lookup.pending_email
            user_lookup.pending_email = ""
            user_lookup.save(update_fields=['email', 'pending_email'])
            print("First request: Email updated successfully.")
        
        # 3. Simulate second verification request (duplicate request)
        user_lookup_2 = User.objects.get(pk=uid)
        is_valid_2 = email_change_token_generator.check_token(user_lookup_2, token)
        print(f"Checking token from second DB lookup: {is_valid_2}")
        if is_valid_2:
            print("Second request: Token is valid (already verified / idempotent success).")
        else:
            print("Second request: Token invalid.")
            
    finally:
        # Restore original state
        user.email = original_email
        user.pending_email = original_pending
        user.save()
else:
    print("No users found.")

