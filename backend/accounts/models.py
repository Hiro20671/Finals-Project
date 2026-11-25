from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class StudentProfile(models.Model):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('ADMIN', 'Administrator'),
    )

    YEAR_LEVEL_CHOICES = (
        ('1st Year', '1st Year'),
        ('2nd Year', '2nd Year'),
        ('3rd Year', '3rd Year'),
        ('4th Year', '4th Year'),
        ('5th Year+', '5th Year+'),
        ('Graduate', 'Graduate Student'),
    )

    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    student_id_number = models.CharField(max_length=30, blank=True)
    university = models.CharField(max_length=150, default='Academic University')
    college = models.CharField(max_length=150, blank=True)
    degree_program = models.CharField(max_length=150, blank=True)
    year_level = models.CharField(max_length=20, choices=YEAR_LEVEL_CHOICES, default='1st Year')
    contact_number = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    profile_picture_url = models.CharField(max_length=500, blank=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_reviews_count = models.PositiveIntegerField(default=0)
    account_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"

    @property
    def display_avatar(self):
        if self.profile_picture:
            return self.profile_picture.url
        if self.profile_picture_url:
            return self.profile_picture_url
        return f"https://api.dicebear.com/7.x/initials/svg?seed={self.user.get_full_name() or self.user.username}"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'ADMIN' if instance.is_staff or instance.is_superuser else 'STUDENT'
        StudentProfile.objects.create(user=instance, role=role)
    else:
        if hasattr(instance, 'student_profile'):
            if instance.is_staff and instance.student_profile.role != 'ADMIN':
                instance.student_profile.role = 'ADMIN'
                instance.student_profile.save()
