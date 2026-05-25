from .models import Profile
from django.db import transaction
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ["email", "password", "password_confirm"]

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exist")
        
        return email
    
    def validate(self, data):
        password = data.get("password")
        password_confirm = data.get("password_confirm")

        errors = {}

        if password and ' ' in password:
            errors["password"] = ["Passsword annot contain white spaces"]
        if password_confirm and ' ' in password_confirm:
            errors["password_confirm"] = ["Passsword annot contain white spaces"]

        if errors:
            raise serializers.ValidationError(errors)
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm":"Passwords do not match"
            })
        
        return data
        
    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password_confirm")
        role = self.context.get('role', Profile.Role.INDIVIDUAL)
        
        user = User(email=validated_data["email"])
        user.set_password(validated_data["password"])

        user.is_active = False
        user.save()

        Profile.objects.create(user=user, role=role)
        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        max_length=256,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type":"password"}    
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.inactive_user = None

    def validate(self, data):
        email = data.get("email").lower()
        password = data.get("password")

        if email and password:
            try:
                user_obj = User.objects.get(email=email)
                if user_obj.check_password(password) and not user_obj.is_active:
                    self.inactive_user = user_obj
                    raise serializers.ValidationError("Account is currently deactivated")
            except User.DoesNotExist:
                pass

            request = self.context.get('request')
            user = authenticate(request, username=email, password=password)

            if user is None:
                raise serializers.ValidationError('Invalid email or password.')
            
            data["user"] = user

        return data
    

class EmailChangeSerializer(serializers.Serializer):
    new_email = serializers.EmailField(max_length=254)
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type":"password"}
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        user = self.context.get('user')
        if user and not(user.has_usable_password()):
            self.fields.pop("password")

        

    def validate_new_email(self, value):
        new_email = value.lower()
        user = self.context.get("user")

        if user and new_email == user.email:
            raise serializers.ValidationError("It is already your current email")
        
        if User.objects.filter(email=new_email).exists():
            raise serializers.ValidationError("Email already exist")
        
        return new_email
    
    def validate_password(self, value):
        user = self.context.get("user")
        
        if user and not user.check_password(value):
            raise serializers.ValidationError("Incorrect Password")
        
        return value
    

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()
    
    def get_user(self):
        email = self.validated_data['email']
        return User.objects.filter(email__iexact=email).first()


class SetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={'input_type': 'password'},
    )

    new_password_confirm = serializers.CharField(
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={'input_type': 'password'},
    )
        
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'Passwords do not match.'}
            )
        return data
    
    def save(self, user):
        user.set_password(self.validated_data['new_password'])
        user.is_active = True
        user.save(update_fields=['password', 'is_active'])
        return user




class PasswordChangeSerializer(serializers.Serializer):
    password = serializers.CharField(
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    new_password = serializers.CharField(
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    new_password_confirm = serializers.CharField(
        min_length=8,
        max_length=20,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    def validate_password(self, value):
        user = self.context.get("user")
        if user and not(user.check_password(value)):
            raise serializers.ValidationError("Incorrect password")
        return value

    def validate(self, data):
        password = data.get("new_password")
        password_confirm = data.get("new_password_confirm")

        errors = {}

        if password and " " in password:
            errors["new_password"] = ["password can not contain white spaces"]
        if password_confirm and " " in password_confirm:
            errors["new_password_confirm"] = ["password can not contain white spaces"]

        if errors:
            raise serializers.ValidationError(errors)

        if password != password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "Passwords don't match"})

        return data

    def save(self, user):
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user

