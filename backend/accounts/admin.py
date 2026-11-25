from django.contrib import admin
from .models import StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'student_id_number', 'university', 'degree_program', 'year_level', 'average_rating', 'account_status')
    list_filter = ('role', 'account_status', 'year_level')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'student_id_number', 'university')
