import uuid
from django.db import models
from django.utils import timezone

from apps.core.models import (
	TimeStampedModel
	)

from apps.core.utils import (
    WILAYA_CHOICES
    )

from apps.profiles.models import (
	Skill,
	EnterpriseProfile,
    IndividualProfile,
	)

from apps.profiles.utils import (
    Industry,
    )

from .utils import (
    JobType,
    JobRole,
    JobPostManager,
    ApplicationStatus, 
    AnnouncementStatus,
    upload_resume_applications,
    )

class Announcement(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enterprise = models.ForeignKey(EnterpriseProfile, on_delete=models.CASCADE, related_name="announcements")
    title = models.CharField(max_length=200, default="")
    industry = models.CharField(max_length=50, choices=Industry.choices)
    role = models.CharField(max_length=50, choices=JobRole.choices)
    wilaya = models.CharField(max_length=50, choices=WILAYA_CHOICES)
    address = models.CharField(max_length=150)
    description = models.TextField()

    job_type = models.CharField(max_length=50, choices=JobType.choices)
    status = models.CharField(max_length=50, choices=AnnouncementStatus.choices, default=AnnouncementStatus.DRAFT)

    required_skills = models.ManyToManyField(Skill, blank=True, related_name="announcements")
    experience_required = models.PositiveIntegerField(default=0, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    applicants = models.PositiveIntegerField(default=0)

    objects = JobPostManager()

    class Meta:
        db_table = "jobs_job_posts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.industry} - {self.role}, {self.job_type} at {self.enterprise.company_name},"

    def is_active(self):
        return self.status == AnnouncementStatus.ACTIVE

    def is_closed(self):
        return self.status == AnnouncementStatus.CLOSED

    def is_draft(self):
        return self.status == AnnouncementStatus.DRAFT

    def close(self):
        self.status = AnnouncementStatus.CLOSED
        self.save(update_fields=["status", "updated_at"])

    def publish(self):
        self.status = AnnouncementStatus.ACTIVE
        self.save(update_fields=["status", "updated_at"])

    @classmethod
    def close_expired(cls):
        today = timezone.localdate()
        expired_announcements = cls.objects.filter(
            status=AnnouncementStatus.ACTIVE,
            deadline__lt=today
        )
        for announcement in expired_announcements:
            announcement.status = AnnouncementStatus.CLOSED
            announcement.save(update_fields=["status", "updated_at"])
            # Reject all pending and reviewed applications
            announcement.applications.filter(
                status__in=[ApplicationStatus.PENDING, ApplicationStatus.REVIEWED]
            ).update(
                status=ApplicationStatus.REJECTED,
                updated_at=timezone.now()
            )

    @property
    def applicant_count(self):
        if hasattr(self, "_applicant_count"):
            return self._applicant_count
        return self.applications.count()

    @applicant_count.setter
    def applicant_count(self, value):
        self._applicant_count = value

class Application(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name="applications")

    applicant = models.ForeignKey(IndividualProfile, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField()

    status = models.CharField(max_length=50, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING)

    resume_file = models.FileField(upload_to=upload_resume_applications, null=True, blank=True)
    class Meta:
        db_table = "jobs_applications"
        ordering = ["-created_at"]

    def __str__(self): 
        return f"{self.applicant}, {self.announcement}, {self.status}"

    def mark_reviewed(self):
        self.status = ApplicationStatus.REVIEWED
        self.save(update_fields=["status", "updated_at"])

    def accept(self):
        self.status = ApplicationStatus.ACCEPTED
        self.save(update_fields=["status", "updated_at"])

    def reject(self):
        self.status = ApplicationStatus.REJECTED
        self.save(update_fields=["status", "updated_at"])

