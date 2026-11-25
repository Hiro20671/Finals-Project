from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, default='BookOpen')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class AcademicMaterial(models.Model):
    CONDITION_CHOICES = (
        ('NEW', 'Brand New / Pristine'),
        ('GOOD', 'Good Condition (Minimal Notes)'),
        ('FAIR', 'Fair Condition (Readable, Minor Wear)'),
        ('USED', 'Heavily Used / Highlighted'),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='academic_materials')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='materials')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    edition = models.CharField(max_length=100, blank=True)
    publication_year = models.PositiveIntegerField(null=True, blank=True)
    isbn = models.CharField(max_length=50, blank=True)
    subject_code = models.CharField(max_length=50, help_text="e.g. CS101, MATH53, BIO10")
    course_name = models.CharField(max_length=200, help_text="e.g. Data Structures, Integral Calculus")
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='GOOD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject_code} ({self.owner.username})"

    @property
    def primary_image_url(self):
        first_img = self.images.filter(is_primary=True).first() or self.images.first()
        if first_img:
            if first_img.image:
                return first_img.image.url
            if first_img.image_url:
                return first_img.image_url
        return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"


class MaterialImage(models.Model):
    material = models.ForeignKey(AcademicMaterial, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='materials/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.material.title}"

    @property
    def display_url(self):
        if self.image:
            return self.image.url
        return self.image_url or "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"


class Listing(models.Model):
    LISTING_TYPES = (
        ('SALE', 'For Sale'),
        ('LEND', 'For Lending'),
        ('DONATION', 'Donation / Free'),
        ('EXCHANGE', 'For Exchange'),
    )

    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('PENDING', 'Transaction Pending'),
        ('BORROWED', 'Currently Borrowed'),
        ('SOLD', 'Sold'),
        ('DONATED', 'Donated'),
        ('EXCHANGED', 'Exchanged'),
        ('UNAVAILABLE', 'Unavailable'),
    )

    APPROVAL_CHOICES = (
        ('APPROVED', 'Approved'),
        ('PENDING', 'Pending Approval'),
        ('REJECTED', 'Rejected'),
    )

    material = models.OneToOneField(AcademicMaterial, on_delete=models.CASCADE, related_name='listing')
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPES, default='SALE')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    lending_period_days = models.PositiveIntegerField(default=14, help_text="Return window in days")
    lending_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    exchange_preferences = models.TextField(blank=True, help_text="Courses/books desired in exchange")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='APPROVED')
    rejection_reason = models.TextField(blank=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.get_listing_type_display()}] {self.material.title} ({self.status})"


class Review(models.Model):
    RATING_CHOICES = [(i, f"{i} Stars") for i in range(1, 6)]

    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    transaction_request = models.ForeignKey('transactions.TransactionRequest', on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewed_user.username} ({self.rating}★)"


class Report(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('INVESTIGATING', 'Under Investigation'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    )

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_submitted')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reports_received')
    reported_listing = models.ForeignKey(Listing, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reason = models.CharField(max_length=255)
    details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} by {self.reporter.username} - {self.reason} ({self.status})"
