from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
import random
from django.db.models import Count, Avg


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SearchViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'product_tags']
    pagination_class = CustomPagination

class OfferViewSet(viewsets.ViewSet):
    def list(self, request):
        # Implement your offer logic here
        offers = {
            "weekly_offers": [
                {"id": 1, "title": "20% off on Electronics", "valid_until": "2025-01-12"},
                {"id": 2, "title": "Buy 1 Get 1 Free", "valid_until": "2025-01-10"}
            ],
            "monthly_offers": [
                {"id": 3, "title": "Seasonal Sale", "valid_until": "2025-02-01"}
            ]
        }
        return Response(offers)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = Product.objects.all()
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(product_tags__icontains='featured')
        return queryset

class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=400)

    @action(detail=False, methods=['post'])
    def signup(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'])
    def send_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        otp = random.randint(100000, 999999)
        # Store OTP in cache or session
        
        send_mail(
            'Your OTP',
            f'Your OTP is: {otp}',
            'from@example.com',
            [email],
            fail_silently=False,
        )
        
        return Response({'message': 'OTP sent successfully'})

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(customer=self.request.user)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cart.objects.filter(customer=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            return Response(CartItemSerializer(cart_item).data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        user = request.user
        recent_orders = Order.objects.filter(customer=user).order_by('-created_at')[:5]
        wishlist_count = Wishlist.objects.filter(customer=user).count()
        cart_count = CartItem.objects.filter(cart__customer=user).count()
        
        return Response({
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'wishlist_count': wishlist_count,
            'cart_count': cart_count,
        })

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate_order(self, request):
        cart = Cart.objects.get(customer=request.user)
        address_id = request.data.get('address_id')
        
        try:
            address = Address.objects.get(id=address_id, customer=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)
        
        total_amount = sum(item.product.price * item.quantity for item in cart.items.all())
        
        order = Order.objects.create(
            customer=request.user,
            address=address,
            total_amount=total_amount
        )
        
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
        
        cart.items.all().delete()
        
        return Response(OrderSerializer(order).data)

class SuggestionViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Get user's purchase history and preferences
        purchased_products = OrderItem.objects.filter(
            order__customer=user
        ).values_list('product__product_related_to', flat=True)
        
        # Get suggested products based on purchase history
        return Product.objects.filter(
            product_tags__in=purchased_products
        ).distinct()[:5]
        
        
class ProductDetailViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    pagination_class = CustomPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductSerializer  # Use simplified serializer for list view
        return ProductDetailSerializer  # Use detailed serializer for retrieve view

    @action(detail=True, methods=['post'])
    def add_rating(self, request, pk=None):
        product = self.get_object()
        rating = request.data.get('rating')
        review = request.data.get('review', '')
        
        if not rating or not (1 <= int(rating) <= 5):
            return Response({'error': 'Invalid rating'}, status=400)
        
        rating_obj, created = ProductRating.objects.update_or_create(
            customer=request.user,
            product=product,
            defaults={'rating': rating, 'review': review}
        )
        
        return Response(ProductRatingDetailSerializer(rating_obj).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        product = self.get_object()
        content = request.data.get('content')
        parent_id = request.data.get('parent_id')
        
        if not content:
            return Response({'error': 'Content is required'}, status=400)
        
        comment_data = {
            'product': product,
            'customer': request.user,
            'content': content
        }
        
        if parent_id:
            try:
                parent_comment = ProductComment.objects.get(id=parent_id)
                comment_data['parent'] = parent_comment
            except ProductComment.DoesNotExist:
                return Response({'error': 'Parent comment not found'}, status=404)
        
        comment = ProductComment.objects.create(**comment_data)
        return Response(ProductCommentSerializer(comment).data)

    @action(detail=True)
    def ratings_summary(self, request, pk=None):
        product = self.get_object()
        ratings = product.ratings.all()
        
        summary = {
            'average_rating': ratings.aggregate(Avg('rating'))['rating__avg'] or 0,
            'total_ratings': ratings.count(),
            'distribution': {
                i: ratings.filter(rating=i).count() for i in range(1, 6)
            }
        }
        
        return Response(summary)        