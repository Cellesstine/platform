from django.db import transaction
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import serializers

from .utils import (
	Availability,
	)

from .models import (
	Skill,
	UserSkill,
	Portfolio,
	Education,
	SocialLink,
	IndividualProfile,
	EnterpriseProfile,
	WorkExperience,
	)

class IndividualProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = IndividualProfile
		fields = ["avatar","first_name", "last_name", "phone", "wilaya", "address", "bio"]

	def validate_first_name(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("First name is required")

		if " " in value:
			raise serializers.ValidationError("First name cannot contain spaces")
		return value.strip().capitalize()

	def validate_last_name(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("Last name is required")

		if " " in value:
			raise serializers.ValidationError("Last name cannot contain spaces")
		return value.strip().capitalize()

	def validate_address(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("address is required")
		return value.strip().title()

	def validate_phone(self, value):
		if not(value.lstrip("+213 ").isdigit()):
			raise serializers.ValidationError("Phone number can only contain digits")
		return value

	@transaction.atomic
	def create(self, validated_data):

		request = self.context["request"]
		profile = request.user.profile

		individual = IndividualProfile(**validated_data)
		individual.__dict__.update(profile.__dict__)
        
		for key, value in validated_data.items():
			setattr(individual, key, value)

		individual.save()
		return individual

class IndividualProfilePostSetupSerializer(serializers.Serializer):
	professional_title = serializers.CharField(max_length=20)
	years_experience = serializers.IntegerField(default=0)

	institution = serializers.CharField(max_length=50, required=False, allow_blank=True)
	degree = serializers.CharField(max_length=50, required=False, allow_blank=True)
	field = serializers.CharField(max_length=50, required=False, allow_blank=True)

	company_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
	job_role = serializers.CharField(max_length=50, required=False, allow_blank=True)

	portfolio_url = serializers.URLField(required=False, allow_blank=True)

	skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)
	availability = serializers.ChoiceField(choices=Availability.choices, default=Availability.AVAILABLE)

	resume_file = serializers.FileField(required=False, allow_null=True)

	def validate_professional_title(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("professional title is required")

		return value.strip().title()

	def validate_years_experience(self, value):
		if value < 0:
			raise serializers.ValidationError("positive digit only")
		
		return value

	def validate_resume_file(self, value):
		if value:
			content_type = getattr(value, "content_type", None)
			size = getattr(value, "size", 0)

			if content_type and (content_type != "application/pdf"):
				raise serializers.ValidationError("Please upload a PDF file")

			if size > 5 * 1024 * 1024:
				raise serializers.ValidationError("PDF file under 5MB")

			return value

	def validate(self, data):
		errors = {}
		if bool(data.get("company_name", "").strip()) != bool(data.get("job_role", "").strip()):
			if not(data.get("company_name", "").strip()):
				errors["company_name"] = "Please fill company name"

			if not(data.get("job_role", "").strip()):
				errors["job_role"] = "Please fill job role"

		education_fields = [data.get("institution","").strip(), data.get("degree", "").strip(), data.get("field", "").strip()]
		if any(education_fields) and not(all(education_fields)):
			if not(data.get("institution", "").strip()):
				errors["institution"] = "Please fill institution name"
			if not(data.get("degree", "").strip()):
				errors["degree"] = "Please fill degree"
			if not(data.get("field", "").strip()):
				errors["field"] = "Please fill study field"

		if errors:
			raise serializers.ValidationError(errors)

		return data

	def save(self, *args, instance, **kwargs):
		data = self.validated_data

		instance.professional_title = data["professional_title"]
		instance.years_experience = data["years_experience"]
		instance.availability = data["availability"]

		if data.get("resume_file"):
			instance.resume_file = data["resume_file"]

		instance.save()

		skills = data.get("skills", [])
		if skills:
			with transaction.atomic():
				UserSkill.objects.filter(individual=instance).delete()
				obj = []
				for skill in skills:
					obj.append(UserSkill(individual=instance, skill=skill))

				UserSkill.objects.bulk_create(obj)

		if data.get("institution") and data.get("degree") and data.get("field"):
			Education.objects.create(individual=instance, institution=data["institution"], degree=data["degree"], field=data["field"])

		if data.get("company_name") and data.get("job_role"):
			WorkExperience.objects.create(individual=instance, company_name=data["company_name"], job_role=data["job_role"])

		if data.get("portfolio_url"):
			Portfolio.objects.create(individual=instance, url=data["portfolio_url"])

		return instance

class EntrepriseProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = EnterpriseProfile
		fields = ["avatar", "company_name", "wilaya", "address", "industry", "company_size", "phone"]

	def validate_company_name(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("Company name is required")

		return value.strip().title()

	def validate_address(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("Address is required")
		return value.strip().title()

	@transaction.atomic
	def create(self, validated_data):
		request = self.context["request"]
		profile = request.user.profile

		enterprise = EnterpriseProfile(**validated_data)
		enterprise.__dict__.update(profile.__dict__)

		for key, value in validated_data.items():
			setattr(enterprise, key, value)

		enterprise.save()
		return enterprise

class EnterpriseVerificationSerializer(serializers.ModelSerializer):
	class Meta:
		model = EnterpriseProfile
		fields = ["register", "website"]


class EducationDetailsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Education
		fields = ["institution", "degree", "field"]

class PortfolioDetailsSerializer(serializers.ModelSerializer):
	class Meta:
		model = Portfolio
		fields = ["url"]

class WorkExperienceDetailsSerializer(serializers.ModelSerializer):
	class Meta:
		model = WorkExperience
		fields = ["company_name", "job_role"]

class SocialLinksDetailsSerializer(serializers.ModelSerializer):
	class Meta:
		model = SocialLink
		fields = ["platform", "url"]

class UserSkillDetailsSerializer(serializers.ModelSerializer):
	skill_id = serializers.IntegerField(source="skill.id", read_only=True)
	skill_name = serializers.CharField(source="skill.name", read_only=True)
	category = serializers.CharField(source="skill.get_category_display", read_only=True)

	class Meta:
		model = UserSkill
		fields = ["skill_id", "skill_name", "category","level"]

class IndividualProfileDetailsSerializer(serializers.ModelSerializer):
	email = serializers.EmailField(source='user.email', read_only=True)
	educations = EducationDetailsSerializer(many=True, read_only=True)
	work_experiences = WorkExperienceDetailsSerializer(many=True, read_only=True)
	social_links = SocialLinksDetailsSerializer(many=True, read_only=True)
	portfolios = PortfolioDetailsSerializer(source="portfolio_items", many=True, read_only=True)
	skills = UserSkillDetailsSerializer(many=True, read_only=True)

	full_name = serializers.CharField(read_only=True)

	class Meta:
		model = IndividualProfile
		fields = ["id", "email", "avatar","first_name", "last_name", "full_name", "phone", "wilaya", "address", "bio",
		"professional_title", "years_experience", "availability", "resume_file", "skills", "educations",
		"work_experiences", "portfolios", "social_links", "created_at"]

class EnterpriseProfileDetailsSerializer(serializers.ModelSerializer):
	email = serializers.EmailField(source='user.email', read_only=True)
	social_links = SocialLinksDetailsSerializer(many=True, read_only=True)

	class Meta:
		model = EnterpriseProfile
		fields = [
			'id', 'email', 'avatar', 'company_name', 'bio', 'phone',
            'wilaya', 'address', 'industry', 'company_size',
            'website', 'verified', 'social_links', 'created_at'
       	]

class ProfessionalListSerializer(serializers.ModelSerializer):
	full_name = serializers.CharField(read_only=True)
	uidb64 = serializers.SerializerMethodField()

	class Meta:
		model = IndividualProfile
		fields = [
			"id",
			"full_name",
			"professional_title",
			"wilaya",
			"years_experience",
			"created_at",
			"uidb64",
			"avatar",
		]

	def get_uidb64(self, obj):
		return urlsafe_base64_encode(force_bytes(obj.user_id))

class EducationInputSerializer(serializers.Serializer):
	institution = serializers.CharField(max_length=200)
	degree = serializers.CharField(max_length=150)
	field = serializers.CharField(max_length=150)

class WorkExperienceInputSerializer(serializers.Serializer):
	company_name = serializers.CharField(max_length=200)
	job_role = serializers.CharField(max_length=150)


class IndividualProfileEditSerializer(serializers.ModelSerializer):
	skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)
	educations = EducationInputSerializer(many=True, required=False)
	work_experiences = WorkExperienceInputSerializer(many=True, required=False)
	portfolio_urls = serializers.ListField(child=serializers.URLField(), required=False, allow_empty=True)

	class Meta:
		model = IndividualProfile
		fields = [
    			"avatar", "bio", "phone", "first_name", "last_name", "wilaya", "address", 
    			"professional_title", "years_experience", "availability", "resume_file",
    			"skills", "educations", "work_experiences", "portfolio_urls",
    		]

	def validate_professional_title(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("professional title is required")

		return value.strip().title()

	def validate_years_experience(self, value):
		if value < 0:
			raise serializers.ValidationError("positive digit only")
		
		return value

	def validate_resume_file(self, value):
		if value:
			content_type = getattr(value, "content_type", None)
			size = getattr(value, "size", 0)

			if content_type and (content_type != "application/pdf"):
				raise serializers.ValidationError("Please upload a PDF file")

			if size > 5 * 1024 * 1024:
				raise serializers.ValidationError("PDF file under 5MB")

			return value

	def validate_first_name(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("First name is required")

		if " " in value:
			raise serializers.ValidationError("First name cannot contain spaces")
		return value.strip().capitalize()

	def validate_last_name(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("Last name is required")

		if " " in value:
			raise serializers.ValidationError("Last name cannot contain spaces")
		return value.strip().capitalize()

	def validate_address(self, value):
		if not(value.strip()):
			raise serializers.ValidationError("address is required")
		return value.strip().title()

	def validate_phone(self, value):
		if not(value.lstrip("+213 ").replace(" ", "").isdigit()):
			raise serializers.ValidationError("Phone number can only contain digits")
		return value

	@transaction.atomic
	def update(self, instance, validated_data):
		skills = validated_data.pop("skills", None)
		educations = validated_data.pop("educations", None)
		work_experiences = validated_data.pop("work_experiences", None)
		portfolio_urls = validated_data.pop("portfolio_urls", None)

		for key, value in validated_data.items():
			setattr(instance, key, value)
		instance.save()

		if skills is not None:
			with transaction.atomic():
				UserSkill.objects.filter(individual=instance).delete()
				obj = []
				for skill in skills:
					obj.append(UserSkill(individual=instance, skill=skill))

				UserSkill.objects.bulk_create(obj)

		if educations is not None:
			with transaction.atomic():
				Education.objects.filter(individual=instance).delete()
				obj = []
				for education in educations:
					obj.append(Education(individual=instance, **education))

				Education.objects.bulk_create(obj)

		if work_experiences is not None:
			with transaction.atomic():
				WorkExperience.objects.filter(individual=instance).delete()
				obj = []
				for work_experience in work_experiences:
					obj.append(WorkExperience(individual=instance, **work_experience))

				WorkExperience.objects.bulk_create(obj)

		if portfolio_urls is not None:
			with transaction.atomic():
				Portfolio.objects.filter(individual=instance).delete()
				obj = []
				for portfolio_url in portfolio_urls:
					obj.append(Portfolio(individual=instance, url=portfolio_url))

				Portfolio.objects.bulk_create(obj)

		return instance

class EnterpriseProfileEditSerializer(serializers.ModelSerializer):
	class Meta:
		model = EnterpriseProfile
		fields = [ 
        	"avatar", "bio", "phone", "company_name", "wilaya", "address",
            "industry", "company_size", "register", "website",
        ]

	def validate_company_name(self, value):
		if not value.strip():
			raise serializers.ValidationError("Company name is required.")
		return value.strip().title()
 
	def validate_address(self, value):
		if not value.strip():
			raise serializers.ValidationError("Address is required.")
		return value.strip().title()

	def validate_phone(self, value):
		if value and not(value.lstrip("+213 ").replace(" ", "").isdigit()):
			raise serializers.ValidationError("Phone number can only contain digits.")
		return value

	@transaction.atomic
	def update(self, instance, validated_data):
		for key, value in validated_data.items():
			setattr(instance, key, value)
		instance.save()
		return instance
