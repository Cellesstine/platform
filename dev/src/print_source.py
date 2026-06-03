import inspect
from django.contrib.auth.tokens import PasswordResetTokenGenerator

print(inspect.getsource(PasswordResetTokenGenerator._make_hash_value))
print("---")
print(inspect.getsource(PasswordResetTokenGenerator.check_token))
