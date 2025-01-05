from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Customer,
    Address,
    Product,
    Wishlist,
    Cart,
    CartItem,
    Order,
    OrderItem,
    ProductRating,
    CustomerActivity
)

# Register Customer with UserAdmin for proper auth management
admin.site.register(Customer, UserAdmin)

# Register all other models
admin.site.register(Address)
admin.site.register(Product)
admin.site.register(Wishlist)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(ProductRating)
admin.site.register(CustomerActivity)
