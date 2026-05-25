import os
import uuid
from django.utils import timezone
from django.db import models

class Availability(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available Now'
    OPEN = 'OPEN', 'Open to Opportunities'
    NOT_AVAILABLE = 'NOT_AVAILABLE', 'Not Available'

class CompanySize(models.TextChoices):
    STARTUP = 'STARTUP', 'Start-Up'
    SMALL = 'SMALL', 'Small'
    MEDIUM = 'MEDIUM', 'Medium'
    LARGE = 'LARGE', 'Large'

class Industry(models.TextChoices):
    TECH = 'TECH', 'Technology'
    FINANCE = 'FINANCE', 'Finance & Banking'
    WATER = 'WATER', 'Water Industry'
    CONSTRUCTION = 'CONSTRUCTION', 'Construction & BTP'
    HEALTHCARE = 'HEALTHCARE', 'Healthcare'
    EDUCATION = 'EDUCATION', 'Education'
    RETAIL = 'RETAIL', 'Retail & Commerce'
    ENERGY = 'ENERGY', 'Energy & Oil'
    AGRICULTURE = 'AGRICULTURE', 'Agriculture'
    TRANSPORT = 'TRANSPORT', 'Transport & Logistics'
    OTHER = 'OTHER', 'Other'

def resume_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    year = timezone.now().year
    unique = uuid.uuid4().hex[:8]
    return f'resumes/individual/{year}/{unique}{ext}'

def enterprise_register_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    year = timezone.now().year
    unique = uuid.uuid4().hex[:8]
    return f'enterprise/register/{year}/{unique}{ext}'

def portfolio_image_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    unique = uuid.uuid4().hex[:8]
    return f'portfolio/{instance.individual.id}/{unique}{ext}'


