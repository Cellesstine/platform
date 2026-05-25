import uuid
from django.db import models  
from apps.core.models import TimeStampedModel
from apps.core.utils import avatar_upload_path
from django.contrib.auth.models import AbstractUser, BaseUserManager


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)
    
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    pending_email = models.EmailField(blank=True, default='')
    
    username = None
    first_name = None
    last_name = None

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'                           
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'account'
        verbose_name_plural = 'accounts'
    
    def __str__(self):
        return self.email

class Profile(TimeStampedModel): 
    class Role(models.TextChoices):
        INDIVIDUAL = 'INDIVIDUAL', 'Individual'
        ENTERPRISE = 'ENTERPRISE', 'Enterprise'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar = models.ImageField(upload_to=avatar_upload_path, default='avatars/default_avatar.png', null=True, blank=True)
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    role = models.CharField(max_length=20, choices=Role.choices)

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile',
        )

    class Meta:
        db_table = 'accounts_profiles'
        verbose_name = 'profile'
        verbose_name_plural = 'profiles'

    def __str__(self):
        return f'{self.user.email}: {self.role}'