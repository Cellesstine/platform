import os
import sys
import django

# Setup django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.jobs.models import Announcement
from apps.profiles.models import EnterpriseProfile, Skill
from apps.profiles.utils import Industry
from apps.jobs.utils import JobRole, JobType, AnnouncementStatus

print("Seeding announcements...")

# Clear existing announcements
Announcement.objects.all().delete()
print("Cleared existing announcements.")

# Find enterprise profiles
yassir = EnterpriseProfile.objects.filter(company_name__icontains="yassir").first()
tlentrr = EnterpriseProfile.objects.filter(company_name__icontains="tlentrr").first()
ifri = EnterpriseProfile.objects.filter(company_name__icontains="ifri").first()

if not yassir or not tlentrr or not ifri:
    print("Error: Enterprise profiles not found in database! Please check company names.")
    sys.exit(1)

# Find or create skills
figma, _ = Skill.objects.get_or_create(name="Figma", defaults={"slug": "figma", "category": "DESIGN"})
python, _ = Skill.objects.get_or_create(name="Python", defaults={"slug": "python", "category": "PROGRAMMING"})
javascript, _ = Skill.objects.get_or_create(name="JavaScript", defaults={"slug": "javascript", "category": "PROGRAMMING"})

# Announcement 1: Yassir - Web Developer
ann1 = Announcement.objects.create(
    enterprise=yassir,
    industry="TECH",
    role="WEB_DEVELOPER",
    wilaya="alger",
    address="Hydra, Alger",
    description="Join Yassir as a Senior Web Developer. You will be responsible for building next-generation micro-services and user interfaces for our on-demand services platform using React and Python. We offer a high-performance workspace, competitive salary, and modern technologies.",
    job_type="FULL_TIME",
    status="ACTIVE",
    experience_required=3,
    deadline="2026-08-30"
)
ann1.required_skills.add(python, javascript)
print(f"Created announcement: {ann1}")

# Announcement 2: Tlentrr - UX/UI Designer
ann2 = Announcement.objects.create(
    enterprise=tlentrr,
    industry="TECH",
    role="UX_UI_DESIGNER",
    wilaya="oran",
    address="Akid Lotfi, Oran",
    description="Tlentrr is looking for a passionate UX/UI Designer to craft outstanding visual designs and interactive user flows. Working closely with engineering and product management teams, you will map out user stories and develop professional prototypes using Figma.",
    job_type="REMOTE",
    status="ACTIVE",
    experience_required=2,
    deadline="2026-09-15"
)
ann2.required_skills.add(figma)
print(f"Created announcement: {ann2}")

# Announcement 3: Ifri - Systems Administrator
ann3 = Announcement.objects.create(
    enterprise=ifri,
    industry="OTHER",
    role="SYSTEM_ADMINISTRATOR",
    wilaya="bejaia",
    address="Ifri, Béjaïa",
    description="Ifri is seeking a Systems Administrator to maintain our enterprise IT infrastructure and networks. You will deploy server images, administer databases, and ensure network security and maximum uptime for our automated packaging lines.",
    job_type="HYBRID",
    status="ACTIVE",
    experience_required=4,
    deadline="2026-07-31"
)
ann3.required_skills.add(python)
print(f"Created announcement: {ann3}")

print("Successfully seeded all announcements!")
