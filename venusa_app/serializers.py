from rest_framework import serializers
from .models import (
    Customer, Product, Wishlist, Cart, CartItem, 
    Order, OrderItem, ProductRating, Address,ProductImage,ProductSpecification,ProductComment
)
from django.contrib.auth.password_validation import validate_password

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'username', 'email', 'phone_number', 'address')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        validate_password(value)
        return value

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return 0
        return sum(r.rating for r in ratings) / len(ratings)

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = '__all__'
    
    def get_total(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'title', 'value']

class ProductCommentSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductComment
        fields = ['id', 'customer_name', 'content', 'created_at', 'updated_at', 'replies']
    
    def get_customer_name(self, obj):
        return obj.customer.username
    
    def get_replies(self, obj):
        if not obj.replies.exists():
            return []
        return ProductCommentSerializer(obj.replies.all(), many=True).data

class ProductRatingDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductRating
        fields = ['id', 'customer_name', 'rating', 'review', 'created_at']
    
    def get_customer_name(self, obj):
        return obj.customer.username

class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    ratings = ProductRatingDetailSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    rating_distribution = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_comments(self, obj):
        # Only get top-level comments (no replies)
        root_comments = obj.comments.filter(parent=None)
        return ProductCommentSerializer(root_comments, many=True).data
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return 0
        return sum(r.rating for r in ratings) / len(ratings)
    
    def get_rating_distribution(self, obj):
        distribution = {i: 0 for i in range(1, 6)}
        for rating in obj.ratings.all():
            distribution[rating.rating] += 1
        return distribution