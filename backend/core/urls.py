"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from core.stats_views import StudentDashboardStatsView, AdminDashboardStatsView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Main API modules
    path('api/auth/', include('accounts.urls')),
    path('api/marketplace/', include('marketplace.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/communications/', include('communications.urls')),

    # Dashboard summaries
    path('api/dashboard/student/', StudentDashboardStatsView.as_view(), name='student-dashboard-stats'),
    path('api/dashboard/admin/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]

# Media file serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
