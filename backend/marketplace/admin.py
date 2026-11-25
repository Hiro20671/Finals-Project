from django.contrib import admin
from .models import Category, AcademicMaterial, MaterialImage, Listing, Review, Report


class MaterialImageInline(admin.TabularInline):
    model = MaterialImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon_name', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(AcademicMaterial)
class AcademicMaterialAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'subject_code', 'course_name', 'category', 'owner', 'condition', 'created_at')
    list_filter = ('condition', 'category')
    search_fields = ('title', 'author', 'subject_code', 'course_name', 'isbn')
    inlines = [MaterialImageInline]


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('material', 'listing_type', 'price', 'status', 'approval_status', 'views_count', 'created_at')
    list_filter = ('listing_type', 'status', 'approval_status')
    search_fields = ('material__title', 'material__author', 'material__owner__username')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewed_user', 'rating', 'created_at')
    list_filter = ('rating',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reporter', 'reported_listing', 'reported_user', 'reason', 'status', 'created_at')
    list_filter = ('status',)
