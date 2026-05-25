from django.contrib import admin
from .models import (
    IndividualProfile,
    EnterpriseProfile,
    SocialLink,
    Skill,
    UserSkill,
    WorkExperience,
    Education,
    Portfolio,
)

class SocialLinkInline(admin.TabularInline):
    model  = SocialLink
    extra  = 0
    fields = ('platform', 'url')


class UserSkillInline(admin.TabularInline):
    model  = UserSkill
    extra  = 0
    fields = ('skill',)


class WorkExperienceInline(admin.TabularInline):
    model  = WorkExperience
    extra  = 0
    fields = ('company_name', 'job_role')


class EducationInline(admin.TabularInline):
    model  = Education
    extra  = 0
    fields = ('institution', 'degree', 'field')


class PortfolioInline(admin.TabularInline):
    model  = Portfolio
    extra  = 0
    fields = ('url',)


@admin.register(IndividualProfile)
class IndividualProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'get_email', 'wilaya', 'availability')
    list_filter = ('wilaya', 'availability')
    search_fields = ('first_name', 'last_name', 'user__email')
    inlines = [SocialLinkInline, UserSkillInline, WorkExperienceInline, EducationInline, PortfolioInline]

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email


@admin.register(EnterpriseProfile)
class EnterpriseProfileAdmin(admin.ModelAdmin):
    list_display  = ('company_name', 'get_email', 'industry', 'wilaya', 'verified')
    list_filter   = ('industry', 'verified', 'wilaya')
    search_fields = ('company_name', 'user__email')
    list_editable = ('verified',)
    inlines       = [SocialLinkInline]

    @admin.display(description='Email')
    def get_email(self, obj):
        return obj.user.email


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display  = ('name', 'category', 'slug')
    list_filter   = ('category',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('profile', 'platform', 'url')
    list_filter  = ('platform',)


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('individual', 'skill', 'level')
    list_filter  = ('level', 'skill__category')


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ('individual', 'job_role', 'company_name')
    list_filter  = ('job_role',)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('individual', 'degree', 'field', 'institution')


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('individual', 'url')