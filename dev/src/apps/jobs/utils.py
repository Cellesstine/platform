from django.db import models

class JobType(models.TextChoices):
    FULL_TIME = "FULL_TIME", "Full-Time"
    PART_TIME = "PART_TIME", "Part-Time"
    CONTRACT = "CONTRACT", "Contract"
    REMOTE = "REMOTE", "Remote"
    HYBRID = "HYBRID", "Hybrid"

class AnnouncementStatus(models.TextChoices):
    DRAFT = "DRAFT",  "Draft"
    ACTIVE = "ACTIVE", "Active"
    CLOSED = "CLOSED", "Closed"

class ApplicationStatus(models.TextChoices):
    PENDING  = "PENDING", "Pending"
    REVIEWED = "REVIEWED", "Reviewed"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"

class JobRole(models.TextChoices):
	GENERAL_PRACTITIONER = "GENERAL_PRACTITIONER", "General Practitioner"
	SPECIALIST_DOCTOR = "SPECIALIST_DOCTOR", "Specialist Doctor"
	NURSE = "NURSE", "Nurse"
	PHARMACIST = "PHARMACIST", "Pharmacist"
	WEB_DEVELOPER = "WEB_DEVELOPER", "Web Developer"
	MOBILE_DEVELOPER = "MOBILE_DEVELOPER", "Mobile Developer"
	DATA_SCIENTIST = "DATA_SCIENTIST", "Data Scientist"
	IT_PROJECT_MANAGER = "IT_PROJECT_MANAGER", "IT Project Manager"
	SYSTEM_ADMINISTRATOR = "SYSTEM_ADMINISTRATOR", "System Administrator"
	SALES_REPRESENTATIVE = "SALES_REPRESENTATIVE", "Sales Representative"
	SALES_DIRECTOR = "SALES_DIRECTOR", "Sales Director"
	PRODUCT_MANAGER = "PRODUCT_MANAGER", "Product Manager"
	PRIMARY_TEACHER = "PRIMARY_TEACHER", "Primary School Teacher"
	HIGH_SCHOOL_TEACHER = "HIGH_SCHOOL_TEACHER", "High School Teacher"
	TRAINER = "TRAINER", "Trainer / Instructor"
	CIVIL_ENGINEER = "CIVIL_ENGINEER", "Civil Engineer"
	MECHANICAL_ENGINEER = "MECHANICAL_ENGINEER", "Mechanical Engineer"
	ARCHITECT = "ARCHITECT", "Architect"
	ACCOUNTANT = "ACCOUNTANT", "Accountant"
	FINANCIAL_ANALYST = "FINANCIAL_ANALYST", "Financial Analyst"
	AUDITOR = "AUDITOR", "Auditor"
	COMMUNICATIONS_OFFICER = "COMMUNICATIONS_OFFICER", "Communications Officer"
	COMMUNITY_MANAGER = "COMMUNITY_MANAGER", "Community Manager"
	ADMINISTRATIVE_ASSISTANT = "ADMINISTRATIVE_ASSISTANT", "Administrative Assistant"
	HR_MANAGER = "HR_MANAGER", "HR Manager"
	GRAPHIC_DESIGNER = "GRAPHIC_DESIGNER", "Graphic Designer"
	UX_UI_DESIGNER = "UX_UI_DESIGNER", "UX/UI Designer"
	VIDEO_EDITOR = "VIDEO_EDITOR", "Video Editor"
	OTHER = "OTHER", "Other"



class JobPostQuerySet(models.QuerySet):
    def active(self):
        return self.filter(status=AnnouncementStatus.ACTIVE)

    def by_wilaya(self, wilaya):
        return self.filter(wilaya=wilaya)

    def by_type(self, job_type):
        return self.filter(job_type=job_type)

    def by_enterprise(self, enterprise_profile):
        return self.filter(enterprise=enterprise_profile)

class JobPostManager(models.Manager):
    def get_queryset(self):
        return JobPostQuerySet(self.model, using=self._db)

    def active(self):
        return self.get_queryset().active()

def upload_resume_applications(instance, filename):
	ext = Path(filename).suffix.lower()
	return f"applications/resumes/{instance.id}{ext}"