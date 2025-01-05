"""
URL configuration for venusa_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'search', SearchViewSet, basename='search')
router.register(r'offers', OfferViewSet, basename='offers')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'suggestions', SuggestionViewSet, basename='suggestions')
router.register(r'products', ProductDetailViewSet, basename='products')

# Example API endpoints and their functionality:
"""
1. Get product details:
   GET /api/products/{id}/
   - Returns detailed product information including images, specifications, comments, and ratings

2. Add rating:
   POST /api/products/{id}/add_rating/
   {
     "rating": 5,
     "review": "Great product!"
   }

3. Add comment:
   POST /api/products/{id}/add_comment/
   {
     "content": "This is a great product",
     "parent_id": null  # Optional, for replies
   }

4. Get ratings summary:
   GET /api/products/{id}/ratings_summary/
   - Returns rating statistics and distribution
"""

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
]
