from django.contrib import admin
from .models import CustomUser, ResearcherProfile, GeneralProfile

admin.site.register(CustomUser) 
admin.site.register(ResearcherProfile) 
admin.site.register(GeneralProfile) 



# # Register your models here.
# class CustomUserAdmin(UserAdmin):
#     add_form = CustomUserCreationForm
#     form = CustomUserChangeForm
#     model = CustomUser
#     list_display = [
#         "email",
#         "username",
#         "is_staff",
#         "is_active",
#     ]

