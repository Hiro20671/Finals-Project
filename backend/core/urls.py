"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

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

from django.views.static import serve

# Serve React Single Page Application (SPA) on non-API routes
frontend_dist = settings.BASE_DIR.parent / 'frontend' / 'dist'
frontend_index = frontend_dist / 'index.html'

urlpatterns += [
    # Fallback to serve /assets/ directly if requested without /static/
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': frontend_dist / 'assets'}),
]

if frontend_index.exists():
    urlpatterns += [
        re_path(r'^(?!api/|admin/|media/|static/|assets/).*$', TemplateView.as_view(template_name='index.html')),
    ]
