import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.jobs.models import Announcement, Application
from apps.jobs.utils import AnnouncementStatus, ApplicationStatus
from apps.profiles.models import EnterpriseProfile, IndividualProfile

def run_test():
    print("Running close_expired test...")
    # Find an enterprise and individual profile to use as dummy
    enterprise = EnterpriseProfile.objects.first()
    individual = IndividualProfile.objects.first()

    if not enterprise or not individual:
        print("Required profiles not found in DB to run test. Please seed or setup profiles first.")
        return

    # Create dummy announcement with deadline in the past
    yesterday = timezone.localdate() - timedelta(days=1)
    announcement = Announcement.objects.create(
        enterprise=enterprise,
        title="Test Expired Job",
        industry=enterprise.industry,
        role="WEB_DEVELOPER",
        wilaya="alger",
        address="123 Test St",
        description="Testing automatic close of expired announcements",
        job_type="FULL_TIME",
        status=AnnouncementStatus.ACTIVE,
        deadline=yesterday
    )
    print(f"Created active announcement with deadline: {announcement.deadline}")

    # Create a pending application
    application = Application.objects.create(
        announcement=announcement,
        applicant=individual,
        cover_letter="Interested in this role.",
        status=ApplicationStatus.PENDING
    )
    print(f"Created pending application for individual: {individual.id}")

    try:
        # Run close_expired
        Announcement.close_expired()

        # Refresh from DB
        announcement.refresh_from_db()
        application.refresh_from_db()

        print(f"After close_expired:")
        print(f"Announcement status: {announcement.status} (Expected: CLOSED)")
        print(f"Application status: {application.status} (Expected: REJECTED)")

        assert announcement.status == AnnouncementStatus.CLOSED, "Announcement status should be CLOSED"
        assert application.status == ApplicationStatus.REJECTED, "Application status should be REJECTED"
        print("SUCCESS: Close expired announcement test passed!")
    except Exception as e:
        print(f"FAILURE: Test failed: {e}")
    finally:
        # Clean up
        application.delete()
        announcement.delete()
        print("Cleaned up database.")

if __name__ == "__main__":
    run_test()
