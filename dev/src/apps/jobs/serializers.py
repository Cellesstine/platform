from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Announcement,
    Application,
    )

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = [
            "enterprise", "industry", "role", "wilaya", "address",
            "description", "job_type", "status", "required_skills",
            "experience_required", "deadline", "created_at",
        ]

        read_only_fields = ["enterprise", "status", "created_at"]

    def validate_address(self, value):
        if not value.strip():
            raise serializers.ValidationError("Address is required.")
        return value.strip().title()

    def validate_experience_required(self, value):
        if not(value.isdigit()):
            raise serializers.ValidationError("positive digits only")

        return value

    def validate_deadline(self, value):
        if value:
            if value < timezone.now().date():
                raise serializers.ValidationError("invalid deadline")
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

        if required_skills is not(None):
            instance.required_skills.set(required_skills)

        return instance


class AnnouncementListSerializer(serializers.ModelSerializer):
    enterprise_name = serializers.CharField(source="enterprise.company_name", read_only=True)
    
    class Meta:
        model = Announcement
        fields = [
            "enterprise_name", "industry", "role", "wilaya",
            "address", "job_type", "status", "created_at",
        ]

class AnnouncementDetailSerializer(AnnouncementListSerializer):
    required_skills = serializers.StringRelatedField(many=True, read_only=True)

    class Meta(AnnouncementListSerializer.Meta):
        fields = [
            "enterprise_name", "industry", "role", "wilaya", "address",
            "description", "job_type", "status", "created_at",
            "experience_required", "deadline", "required_skills",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.CharField(source="applicant.email", read_only=True)
    
    class Meta:
        model = Application
        fields = [
            "announcement", "applicant", "status",
            "resume_file", "cover_letter", "created_at",
        ]

        read_only_fields = ["status", "created_at"]

    def validate_resume_file(self, value):
        if value:
            content_type = getattr(value, "content_type", None)
            size = getattr(value, "size", 0)

            if content_type and content_type != "application/pdf":
                raise serializers.ValidationError("Please upload a PDF file.")

            if size > 5 * 1024 * 1024:
                raise serializers.ValidationError("PDF file must be under 5MB.")

        return value

    def create(self, validated_data):
        return Application.objects.create(**validated_data)


class ApplicationDetailsSerializer(serializers.ModelSerializer):
    announcement_title = serializers.CharField(source="announcement.role", read_only=True)
    applicant = serializers.CharField(source="applicant.email", read_only=True)

    class Meta:
        model = Application
        fields = [
            "announcement", "announcement_title", "applicant",
            "status", "resume_file", "cover_letter", "created_at",
        ]