from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.tokens import default_token_generator
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import (
    Profile,
    )

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    EmailChangeSerializer,
    PasswordResetSerializer,
    SetPasswordSerializer,
    PasswordChangeSerializer,
    )

from .utils import (
    decode_uid,
    send_verification_email,
    send_reactivation_email,
    send_email_change_verification,
    send_password_reset_email,
    ROLE_MAP,
    )

User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def registerView(request):
    role_param = request.data.get("role", "").lower()

    if role_param not in ROLE_MAP:
        return Response(
                {"error": "Invalid role"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    role = ROLE_MAP[role_param]
    serializer = RegisterSerializer(data=request.data, context={"role":role, "request":request})
    if serializer.is_valid():
        user = serializer.save()
        send_verification_email(request, user)
        return Response(
                {"detail":"registration successful, verify account"},
                status=status.HTTP_201_CREATED,
            )
            
    return Response(
            serializer.errors, status=status.HTTP_400_BAD_REQUEST,
        )

@api_view(["POST"])
@permission_classes([AllowAny])
def loginView(request):
    serializer = LoginSerializer(data=request.data, context={"request":request})
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        needs_profile_setup = not hasattr(user, 'profile') or (
                    user.profile.role == Profile.Role.INDIVIDUAL
                    and not hasattr(user.profile, 'individualprofile')
                )

        return Response({
                "role":user.profile.role,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                'needs_profile_setup': needs_profile_setup,
            },
                status=status.HTTP_200_OK,
            )

    if getattr(serializer, 'inactive_user', None):
        return Response({
            'detail': 'This account is currently deactivated.',
            'inactive': True,
            'email': serializer.inactive_user.email,
        }, status=status.HTTP_403_FORBIDDEN)

    return Response(
        serializer.errors, status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
    refresh_token = request.data.get('refresh')
 
    if not refresh_token:
        return Response(
            {'error': 'Refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
 
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except TokenError:
        return Response(
            {'error': 'Invalid or expired refresh token.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def verifyEmailView(request, uidb64, token):
    user = decode_uid(uidb64)
 
    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save(update_fields=['is_active'])
 
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'Email verified successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
 
    return Response(
        {'error': 'Verification link is invalid or has expired.'},
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def requestReactivationView(request):
    email = request.data.get('email', '').lower()
 
    try:
        user = User.objects.get(email=email)
        if not user.is_active:
            send_reactivation_email(request, user)
    except User.DoesNotExist:
        pass
 
    return Response(
        {'detail': 'if email exist, reactivation link has been sent'},
        status=status.HTTP_200_OK,
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def reactivateAccountView(request, uidb64, token):
    user = decode_uid(uidb64)
 
    if user and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save(update_fields=['is_active'])
 
        refresh = RefreshToken.for_user(user)
        return Response({
            'detail': 'Account reactivated successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
 
    return Response(
        {'error': 'Reactivation link is invalid or has expired.'},
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def deleteAccountView(request):
    user = request.user
    password = request.data.get("password")
    if not(user.check_password(password)):
        return Response({'error': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def deactivateAccountView(request):
    user = request.user
    password = request.data.get("password")

    if not(user.check_password(password)):
        return Response({'error': 'Incorrect password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.is_active = False
    user.save(update_fields=["is_active"])
    return Response({'detail': 'Account deactivated'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def changeEmailView(request):
    serializer = EmailChangeSerializer(
        data=request.data,
        context={'user': request.user, 'request': request},
    )
 
    if serializer.is_valid():
        request.user.pending_email = serializer.validated_data['new_email']
        request.user.save(update_fields=['pending_email'])
        send_email_change_verification(request, request.user)
 
        return Response(
            {'detail': 'Verification email sent to the new address'},
            status=status.HTTP_200_OK,
        )
 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
@api_view(['GET'])
@permission_classes([AllowAny])
def verifyEmailChangeView(request, uidb64, token):
    user = decode_uid(uidb64)
 
    if user and default_token_generator.check_token(user, token) and user.pending_email:
        user.email = user.pending_email
        user.pending_email = ""
        user.save(update_fields=['email', 'pending_email'])
 
        return Response(
            {'detail': 'Email address updated successfully'},
            status=status.HTTP_200_OK,
        )
 
    return Response(
        {'error': 'Verification link is invalid/expired.'},
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def passwordResetRequestView(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.get_user()
        if user is not None:
            send_password_reset_email(request, user)
 
    return Response(
        {'detail': 'If email exists, a reset link has been sent'},
        status=status.HTTP_200_OK,
    )
 

@api_view(['POST'])
@permission_classes([AllowAny])
def passwordResetConfirmView(request, uidb64, token):
    user = decode_uid(uidb64)
 
    if not user or not default_token_generator.check_token(user, token):
        return Response(
            {'error': 'Reset link is invalid/expired.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
 
    serializer = SetPasswordSerializer(data=request.data)
 
    if serializer.is_valid():
        serializer.save(user=user)
        return Response({'detail': 'Password reset successfully.'}, status=status.HTTP_200_OK)
 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def passwordChangeView(request):
    if not request.user.has_usable_password():
        return Response(
            {'error': 'No password set'},
            status=status.HTTP_400_BAD_REQUEST,
        )
 
    serializer = PasswordChangeSerializer(
        data=request.data,
        context={'user': request.user},
    )
 
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)
 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setPasswordView(request):
    if request.user.has_usable_password():
        return Response(
            {'error': 'Account already has a password'},
            status=status.HTTP_400_BAD_REQUEST,
        )
 
    serializer = SetPasswordSerializer(data=request.data)
 
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response({'detail': 'Password set successfully.'}, status=status.HTTP_200_OK)
 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)