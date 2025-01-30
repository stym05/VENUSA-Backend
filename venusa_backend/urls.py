# from django.contrib import admin
# from django.urls import path,include
# from rest_framework.routers import DefaultRouter
# from django.urls import path, include
# from venusa_app.views import (
#     SearchViewSet, OfferViewSet, CategoryViewSet, AuthViewSet,
#     WishlistViewSet, CartViewSet, DashboardViewSet, OrderViewSet,
#     SuggestionViewSet, ProductDetailViewSet
# )

# from django.conf import settings
# from django.conf.urls.static import static


# router = DefaultRouter()
# router.register(r'search', SearchViewSet, basename='search')
# router.register(r'offers', OfferViewSet, basename='offers')
# router.register(r'categories', CategoryViewSet, basename='categories')
# router.register(r'auth', AuthViewSet, basename='auth')
# router.register(r'wishlist', WishlistViewSet, basename='wishlist')
# router.register(r'cart', CartViewSet, basename='cart')
# router.register(r'dashboard', DashboardViewSet, basename='dashboard')
# router.register(r'orders', OrderViewSet, basename='orders')
# router.register(r'suggestions', SuggestionViewSet, basename='suggestions')
# router.register(r'products', ProductDetailViewSet, basename='products')

# # Example API endpoints and their functionality:

# urlpatterns = [
#     path('api/', include(router.urls)),
#     path('admin/', admin.site.urls),
#      path('api/', include('venusa_app.urls')),  # Include your app URLs
# ] 

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# venusa_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Redirect root URL to API
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    
    # Admin and API URLs
    path('admin/', admin.site.urls),
    path('api/', include('venusa_app.urls')),
]

# Add static/media URL patterns only in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)