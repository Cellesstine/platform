import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Profile
from apps.profiles.serializers import EntrepriseProfileSerializer
from django.test import RequestFactory

User = get_user_model()

# Clean up existing test user if any
User.objects.filter(email="test_setup_enterprise@linkio.dz").delete()

# Create user
user = User.objects.create_user(
    email="test_setup_enterprise@linkio.dz",
    password="password123",
)

# Profile should be created automatically by signal or manually
profile, created = Profile.objects.get_or_create(user=user, role=Profile.Role.ENTERPRISE)
print("Profile created:", created, "Profile ID:", profile.id)

# Create a mock request
factory = RequestFactory()
request = factory.post('/profile/')
request.user = user

# Prepare data matching frontend payload
data = {
    "company_name": "Linkio Corp",
    "wilaya": "alger",
    "address": "05 Rue Didouche Mourad",
    "phone": "+213555123456",
    "industry": "TECH",
    "company_size": "STARTUP"
}

# Run serializer
serializer = EntrepriseProfileSerializer(data=data, context={"request": request})
is_valid = serializer.is_valid()
print("Serializer is valid:", is_valid)
if not is_valid:
    print("Errors:", serializer.errors)
else:
    try:
        enterprise = serializer.save()
        print("Success! Enterprise profile saved. ID:", enterprise.id)
    except Exception as e:
        import traceback
        print("EXCEPTION OCCURRED DURING SAVE:")
        traceback.print_exc()
