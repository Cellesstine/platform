from django.db import models
from apps.accounts.models import Profile
from apps.core.models import TimeStampedModel
from apps.core.utils import WILAYA_CHOICES
from .utils import(
    resume_upload_path,
    enterprise_register_upload_path,
    CompanySize,
    Industry,
    Availability,
)


class SocialLink(TimeStampedModel):
    class Platform(models.TextChoices):
        LINKEDIN   = 'LINKEDIN',   'LinkedIn'
        GITHUB     = 'GITHUB',     'GitHub'
        TWITTER    = 'TWITTER',    'Twitter / X'
        INSTAGRAM  = 'INSTAGRAM',  'Instagram'
        YOUTUBE    = 'YOUTUBE',    'YouTube'
        WEBSITE    = 'WEBSITE',    'Personal Website'

    profile = models.ForeignKey(
        'accounts.Profile',
        on_delete=models.CASCADE,
        related_name='social_links',
    )

    platform = models.CharField(
        max_length=20,
        choices=Platform.choices,
    )

    url = models.URLField(max_length=500)

    class Meta:
        db_table        = 'profiles_social_links'
        unique_together = [('profile', 'platform')]
        ordering        = ['platform']

    def __str__(self):
        return f"{self.get_platform_display()} — {self.profile}"
    
class Skill(TimeStampedModel):
    class Category(models.TextChoices): 
        PROGRAMMING = 'PROGRAMMING', 'Programming'
        DESIGN = 'DESIGN', 'Design'
        MARKETING = 'MARKETING', 'Marketing'
        MANAGEMENT = 'MANAGEMENT', 'Management'
        FINANCE = 'FINANCE', 'Finance'
        ENGINEERING = 'ENGINEERING', 'Engineering'
        DATA = 'DATA', 'Data & Analytics'
        LANGUAGES = 'LANGUAGES', 'Languages'
        OTHER = 'OTHER', 'Other'

    name = models.CharField(max_length=100, unique=True)

    slug = models.SlugField(
        max_length=120,
        unique=True,
    )

    category = models.CharField(
        max_length=20,
        choices=Category.choices, 
    )

    class Meta:
        db_table  = 'profiles_skills'
        ordering  = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

class UserSkill(TimeStampedModel):
    class Level(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        EXPERT = 'EXPERT', 'Expert'

    individual = models.ForeignKey(
        'profiles.IndividualProfile',
        on_delete=models.CASCADE,
        related_name='skills',
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.PROTECT,
        related_name='user_skills',
    )

    level = models.CharField(
        max_length=15,
        choices=Level.choices,
        default=Level.BEGINNER,
    )

    class Meta:
        db_table = 'profiles_user_skills'
        unique_together = [('individual', 'skill')]

    def __str__(self):
        return f"{self.individual.full_name} — {self.skill.name} ({self.level})"

class WorkExperience(TimeStampedModel):
    individual   = models.ForeignKey(
        'profiles.IndividualProfile',
        on_delete=models.CASCADE,
        related_name='work_experiences',
    )
    
    company_name = models.CharField(max_length=200)
    job_role = models.CharField(max_length=150)

    class Meta:
        db_table = 'profiles_work_experience'

    def __str__(self):
        return f"{self.job_role} at {self.company_name}"

class Education(TimeStampedModel):
    individual  = models.ForeignKey(
        'profiles.IndividualProfile',
        on_delete=models.CASCADE,
        related_name='educations',
    )

    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field = models.CharField(max_length=150)

    class Meta:
        db_table = 'profiles_education'

    def __str__(self):
        return f"{self.degree} in {self.field}, at {self.institution}"

class Portfolio(TimeStampedModel):
    individual = models.ForeignKey(
        'profiles.IndividualProfile',
        on_delete=models.CASCADE,
        related_name='portfolio_items',
    )

    url = models.URLField()

    class Meta:
        db_table = 'profiles_portfolio'

    def __str__(self):
        return self.url

class IndividualProfile(Profile):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    wilaya = models.CharField(
        max_length=50,
        choices=WILAYA_CHOICES, 
    )
    address = models.CharField(max_length=30)
    professional_title = models.CharField(max_length=50)
    years_experience = models.PositiveIntegerField(default=0)
    availability = models.CharField(
        max_length=20,
        choices=Availability.choices,
        default=Availability.AVAILABLE 
    )
    resume_file = models.FileField(
        upload_to=resume_upload_path,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Individual Profile'
        verbose_name_plural = 'Individual Profiles'
        db_table = 'profiles_individual'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()
    
    def __str__(self):
        return f'{self.full_name}, {self.professional_title}'

class EnterpriseProfile(Profile):
    company_name = models.CharField(max_length=200)
    wilaya = models.CharField(
        max_length=50,
        choices=WILAYA_CHOICES,
    )
    address = models.CharField(
        max_length=50,
    )
    industry = models.CharField(
        max_length=50,
        choices=Industry.choices,
        default=Industry.OTHER,
    )
    company_size = models.CharField(
        max_length=10,
        choices=CompanySize.choices,
    )
    register = models.FileField(
        upload_to=enterprise_register_upload_path,
        blank=True,
        null=True,
    )

    website = models.URLField(blank=True, null=True)

    verified = models.BooleanField(
        default=False,
    )

    class Meta:
        verbose_name = 'Enterprise Profile'
        verbose_name_plural = 'Enterprise Profiles'
        db_table = 'profiles_enterprise'

    def __str__(self):
        if self.verified:
            return f"{self.company_name} ✓"
        return f"{self.company_name}, unverified"
