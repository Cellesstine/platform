from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Announcement, Application

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Announcement
        fields = [
            "id",
            "enterprise",
            "industry", "role", "wilaya", "address", "description",
            "job_type", "status",
            "required_skills",
            "experience_required", "deadline",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_address(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Address cannot be blank.")
        return stripped.title()

    def validate_experience_required(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Experience must be a positive number.")
        return value

    def validate_deadline(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "Deadline cannot be in the past."
            )
        return value

    def validate(self, attrs):
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        required_skills = validated_data.pop("required_skills", [])
        announcement = Announcement.objects.create(**validated_data)
        if required_skills:
            announcement.required_skills.set(required_skills)
        return announcement

    @transaction.atomic
    def update(self, instance, validated_data):
        # Pop M2M before bulk-setting scalars — you cannot set M2M before
        # the parent row exists, and setattr doesn't know about M2M at all.
        required_skills = validated_data.pop("required_skills", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        # `None` means the client didn't send the field (PATCH) — keep existing.
        # `[]`   means the client explicitly cleared the list — honour that.
        if required_skills is not None:
            instance.required_skills.set(required_skills)

        return instance

class AnnouncementListSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(
        source="enterprise.company_name", read_only=True
    )
    enterprise_avatar = serializers.SerializerMethodField(read_only=True)
    applicant_count = serializers.IntegerField(read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    job_type_display = serializers.CharField(source="get_job_type_display", read_only=True)
    industry_display = serializers.CharField(source="get_industry_display", read_only=True)
    wilaya_display = serializers.CharField(source="get_wilaya_display", read_only=True)
    required_skills = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model  = Announcement
        fields = [
            "id",
            "enterprise_name",
            "enterprise_avatar",
            "industry", "industry_display",
            "role", "role_display",
            "wilaya", "wilaya_display",
            "address",
            "job_type", "job_type_display",
            "status",
            "applicant_count",
            "deadline",
            "created_at",
            "description",
            "experience_required",
            "required_skills",
        ]

    def get_enterprise_avatar(self, obj):
        if obj.enterprise and obj.enterprise.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.enterprise.avatar.url)
            return obj.enterprise.avatar.url
        return None


class AnnouncementDetailSerializer(AnnouncementListSerializer):
    class Meta(AnnouncementListSerializer.Meta):
        fields = AnnouncementListSerializer.Meta.fields

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Application
        fields = [
            "id",
            "announcement",
            "applicant",
            "cover_letter",
            "resume_file",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_resume_file(self, value):
        if value:
            content_type = getattr(value, "content_type", None)
            size         = getattr(value, "size", 0)

            if content_type and content_type != "application/pdf":
                raise serializers.ValidationError("Only PDF files are accepted.")
            if size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Resume must be under 5 MB.")
        return value

    def validate(self, attrs):
        announcement = attrs.get("announcement")
        if announcement and not announcement.is_active():
            raise serializers.ValidationError(
                {"announcement": "You can only apply to active announcements."}
            )

        # Duplicate check (before the DB constraint fires)
        applicant = attrs.get("applicant")
        if announcement and applicant:
            if Application.objects.filter(
                announcement=announcement, applicant=applicant
            ).exists():
                raise serializers.ValidationError(
                    "You have already applied to this announcement."
                )

        return attrs

    def create(self, validated_data):
        return Application.objects.create(**validated_data)


# ─────────────────────────────────────────────────────────────────────────────

class ApplicationDetailsSerializer(serializers.ModelSerializer):
    announcement_title    = serializers.CharField(source="announcement.role",          read_only=True)
    announcement_company  = serializers.CharField(source="announcement.enterprise.company_name", read_only=True)
    announcement_company_avatar = serializers.SerializerMethodField()
    applicant_email       = serializers.CharField(source="applicant.user.email",       read_only=True)
    applicant_name        = serializers.SerializerMethodField()
    applicant_title       = serializers.CharField(source="applicant.professional_title", read_only=True, default="")
    applicant_years_exp   = serializers.IntegerField(source="applicant.years_experience", read_only=True, default=0)
    applicant_wilaya      = serializers.CharField(source="applicant.wilaya", read_only=True, default="")
    applicant_wilaya_display = serializers.CharField(source="applicant.get_wilaya_display", read_only=True, default="")
    applicant_skills      = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            "id",
            "announcement", "announcement_title", "announcement_company", "announcement_company_avatar",
            "applicant",    "applicant_email",    "applicant_name",
            "applicant_title", "applicant_years_exp", "applicant_wilaya", "applicant_wilaya_display", "applicant_skills",
            "status",
            "cover_letter",
            "resume_file",
            "created_at",
        ]

    def get_applicant_name(self, obj):
        return f"{obj.applicant.first_name} {obj.applicant.last_name}".strip()

    def get_applicant_skills(self, obj):
        if obj.applicant:
            return [s.skill.name for s in obj.applicant.skills.all()]
        return []

    def get_announcement_company_avatar(self, obj):
        if obj.announcement and obj.announcement.enterprise and obj.announcement.enterprise.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.announcement.enterprise.avatar.url)
            return obj.announcement.enterprise.avatar.url
        return None


# ─────────────────────────────────────────────────────────────────────────────

class ApplicationStatusSerializer(serializers.ModelSerializer):
    VALID_TRANSITIONS = {
        "PENDING":  {"REVIEWED"},
        "REVIEWED": {"ACCEPTED", "REJECTED"},
        "ACCEPTED": set(),
        "REJECTED": set(),
    }

    class Meta:
        model  = Application
        fields = ["status"]

    def validate_status(self, value):
        current = self.instance.status if self.instance else None
        allowed = self.VALID_TRANSITIONS.get(current, set())

        if value not in allowed:
            raise serializers.ValidationError(
                f"Cannot transition from '{current}' to '{value}'. "
                f"Allowed: {allowed or 'none (terminal state)'}."
            )
        return value