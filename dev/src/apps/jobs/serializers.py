from django.db import transaction
from rest_framework import serializers

from .models import Announcement, Application


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "id", "enterprise", "title", "industry", "role", "wilaya", "address",
            "description", "job_type", "status", "required_skills",
            "experience_required", "deadline", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Le titre est obligatoire.")
        if len(value) > 200:
            raise serializers.ValidationError("Le titre ne peut pas dépasser 200 caractères.")
        return value

    def validate_address(self, value):
        if not value.strip():
            raise serializers.ValidationError("Address is required.")
        return value.strip().title()

    def validate_experience_required(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Experience required must be a positive number.")
        return value

    def validate_deadline(self, value):
        if value:
            from django.utils import timezone
            if value < timezone.now().date():
                raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        required_skills = validated_data.pop("required_skills", [])
        post = Announcement.objects.create(**validated_data)
        if required_skills:
            post.required_skills.set(required_skills)
        return post

    @transaction.atomic
    def update(self, instance, validated_data):
        required_skills = validated_data.pop("required_skills", None)

        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()

        if required_skills is not None:
            instance.required_skills.set(required_skills)

        return instance


class AnnouncementListSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source="enterprise.company_name", read_only=True)
    required_skills = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Announcement
        fields = [
            "id", "enterprise", "enterprise_name", "title", "industry", "role",
            "wilaya", "address", "job_type", "status",
            "experience_required", "deadline", "required_skills", "created_at",
        ]


class AnnouncementDetailSerializer(AnnouncementListSerializer):
    class Meta(AnnouncementListSerializer.Meta):
        fields = AnnouncementListSerializer.Meta.fields + ["description"]


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id", "announcement", "applicant", "status",
            "resume_file", "cover_letter", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_resume_file(self, value):
        if value:
            content_type = getattr(value, "content_type", None)
            size = getattr(value, "size", 0)

            if content_type and content_type != "application/pdf":
                raise serializers.ValidationError("Please upload a PDF file.")

            if size > 5 * 1024 * 1024:
                raise serializers.ValidationError("PDF file must be under 5MB.")

        return value

    def validate(self, data):
        errors = {}

        announcement = data.get("announcement") or (
            self.instance.announcement if self.instance else None
        )
        applicant = data.get("applicant") or (self.instance.applicant if self.instance else None)

        if announcement and not announcement.is_active():
            errors["announcement"] = "Cannot apply to an inactive announcement."

        if not self.instance:
            if announcement and applicant:
                if Application.objects.filter(
                    announcement=announcement, applicant=applicant
                ).exists():
                    errors["applicant"] = "You have already applied to this announcement."

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        return Application.objects.create(**validated_data)


class ApplicationDetailsSerializer(serializers.ModelSerializer):
    announcement_title = serializers.CharField(source="announcement.title", read_only=True)
    applicant_name = serializers.CharField(source="applicant.__str__", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "announcement", "announcement_title",
            "applicant", "applicant_name",
            "status", "resume_file", "cover_letter", "created_at",
        ]
