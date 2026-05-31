from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from apps.accounts.utils import (
    ROLE_MAP,
    decode_uid,
)

from apps.accounts.models import (
    Profile
)

from .models import IndividualProfile, EnterpriseProfile

from .serializers import (
    IndividualProfileSerializer,
    IndividualProfilePostSetupSerializer,
    IndividualProfileDetailsSerializer,
    EntrepriseProfileSerializer,
    EnterpriseVerificationSerializer,
    EnterpriseProfileDetailsSerializer,
    ProfessionalListSerializer,
    )

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def profileSetup(request):
    if request.method == "GET":
        professionals = IndividualProfile.objects.all().order_by("-created_at")
        serializer = ProfessionalListSerializer(professionals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    role_param = request.data.get("role", "").lower()

    if not(role_param in ROLE_MAP):
        return Response({
            "error": "invalid role"
            }, status=status.HTTP_400_BAD_REQUEST
            )

    role = ROLE_MAP[role_param]

    if role == Profile.Role.INDIVIDUAL:
        serializer = IndividualProfileSerializer(data=request.data, context={"request":request})
    else:
        serializer = EntrepriseProfileSerializer(data=request.data, context={"request":request})

    if serializer.is_valid():
        serializer.save()
        return Response({
            "detail": "Successful profile setup"
            },
            status=status.HTTP_201_CREATED,
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def postProfileSetup(request):
    profile = request.user.profile
    role = profile.role

    if role == Profile.Role.INDIVIDUAL:
        instance = request.user.profile.individualprofile
        serializer = IndividualProfilePostSetupSerializer(data=request.data)

    else:
        instance = request.user.profile.enterpriseprofile
        serializer = EnterpriseVerificationSerializer(data=request.data, instance=instance, partial=True)

    if serializer.is_valid():
        if role == Profile.Role.INDIVIDUAL:
            serializer.save(instance=instance)
        else:
            serializer.save()

        return Response({
                "detail":"Success post setup"
                }, status=status.HTTP_201_CREATED)



    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH", "PUT"])
@permission_classes([IsAuthenticated])
def profileEdit(request):
    profile = request.user.profile
    role = profile.role

    partial_edit = (request.method == "PATCH")

    if role == Profile.Role.INDIVIDUAL:
        if not hasattr(profile, "individualprofile"):
            return Response({"error": "Individual profile not found."}, status=status.HTTP_404_NOT_FOUND)

        instance = profile.individualprofile
        serializer = IndividualProfileEditSerializer(instance, data=request.data, partial=partial_edit)

    else:
        if not hasattr(profile, "enterpriseprofile"):
            return Response({"error": "Enterprise profile not found."}, status=status.HTTP_404_NOT_FOUND)
        
        instance = profile.enterpriseprofile
        serializer = EnterpriseProfileEditSerializer(instance, data=request.data, partial=partial_edit)
 
    if serializer.is_valid():
        serializer.save()
        return Response({"detail": "Profile updated successfully."}, status=status.HTTP_200_OK)
 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profileDetails(request, uidb64):
    # Try decoding as base64 user primary key
    user = decode_uid(uidb64)
    profile = None
    is_owner = False
    
    if user is not None and hasattr(user, 'profile'):
        profile = user.profile
        is_owner = (request.user == user)
    else:
        # Try finding by profile ID (UUID) directly
        try:
            import uuid
            val_uuid = uuid.UUID(uidb64)
            profile = Profile.objects.filter(id=val_uuid).first()
            if profile is not None:
                is_owner = (request.user == profile.user)
        except (ValueError, TypeError, AttributeError):
            pass
            
    if profile is None:
        return Response(
            {'error': 'Profile not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if profile.role == Profile.Role.INDIVIDUAL:
        if not hasattr(profile, 'individualprofile'):
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Optimize database query using select_related and prefetch_related
        individual_profile = IndividualProfile.objects.select_related('user').prefetch_related(
            'educations',
            'work_experiences',
            'social_links',
            'portfolio_items',
            'skills__skill'
        ).get(id=profile.individualprofile.id)

        serializer = IndividualProfileDetailsSerializer(individual_profile, context={'request': request})
    else:
        if not hasattr(profile, 'enterpriseprofile'):
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,)

        # Optimize database query using select_related and prefetch_related
        enterprise_profile = EnterpriseProfile.objects.select_related('user').prefetch_related(
            'social_links'
        ).get(id=profile.enterpriseprofile.id)

        serializer = EnterpriseProfileDetailsSerializer(enterprise_profile, context={'request': request})

    return Response(
        {**serializer.data, "is_owner": is_owner},
        status=status.HTTP_200_OK,
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def myProfileDetails(request):
    user = request.user
    if not hasattr(user, 'profile'):
        return Response(
            {'error': 'Profile not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    profile = user.profile
    if profile.role == Profile.Role.INDIVIDUAL:
        if not hasattr(profile, 'individualprofile'):
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Optimize database query using select_related and prefetch_related
        individual_profile = IndividualProfile.objects.select_related('user').prefetch_related(
            'educations',
            'work_experiences',
            'social_links',
            'portfolio_items',
            'skills__skill'
        ).get(id=profile.individualprofile.id)

        serializer = IndividualProfileDetailsSerializer(individual_profile, context={'request': request})
    else:
        if not hasattr(profile, 'enterpriseprofile'):
            return Response(
                {'error': 'Profile not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Optimize database query using select_related and prefetch_related
        enterprise_profile = EnterpriseProfile.objects.select_related('user').prefetch_related(
            'social_links'
        ).get(id=profile.enterpriseprofile.id)

        serializer = EnterpriseProfileDetailsSerializer(enterprise_profile, context={'request': request})

    return Response(
        {**serializer.data, "is_owner": True},
        status=status.HTTP_200_OK,
    )


from .models import Skill
from django.utils.text import slugify

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def searchOrCreateSkills(request):
    if request.method == "GET":
        q = request.GET.get("q", "")
        if q:
            skills = Skill.objects.filter(name__icontains=q)[:20]
        else:
            skills = Skill.objects.all()[:50]
        data = [{"id": s.id, "name": s.name, "category": s.get_category_display()} for s in skills]
        return Response(data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        if not request.user or not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        name = request.data.get("name", "").strip()
        category = request.data.get("category", "OTHER").upper()
        if not name:
            return Response({"error": "Skill name is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check valid category
        valid_categories = [c[0] for c in Skill.Category.choices]
        if category not in valid_categories:
            category = "OTHER"

        slug = slugify(name)
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while Skill.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        skill, created = Skill.objects.get_or_create(
            name=name,
            defaults={"slug": slug, "category": category}
        )
        return Response({
            "id": skill.id,
            "name": skill.name,
            "category": skill.get_category_display()
        }, status=status.HTTP_201_CREATED)
