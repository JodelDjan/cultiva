from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin 
# Create your models here.

#Custom user manager
class CustomUserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', CustomUser.ADMIN)
        return self.create_user(email, password, **extra_fields)
    
 #Tag Choices
TAG_CHOICES =[
        ('health and fitness', 'Health and Fitness'),
        ('mental health', 'Mental Health'),
        ('nedicine', 'Medicine'),
        ('law', 'Law'),
        ('technology', 'Technology'),
        ('public health', 'Public Health'),
        ('nutrition', 'Nutrition'),
        ('molecular biology', 'Molecular Biology'),
        ('pharmacology', 'Pharmacology'),
        ('biomedical science', 'Biomedical Science'),
        ('microbiology', 'Microbiology'),
        ('anantomy and physiology', 'Anatomy and Physiology'),
        ('immunology', 'Immunology'),
        ('environmental science', 'Environmental Science'),
        ('business', 'Business'),
        ('software development', 'Software Development'),
    ]

    # Range Choices
AGE_RANGE_CHOICES = [
        ('18-25', '18-25'),
        ('25-40', '25-40'),
        ('40-60', '40-60'),
        ('60+',   '60+'),
    ]

ROLE_CHOICES = [
        ('GEN_USER', 'general_user'),
        ('RESEARCHER', 'researcher'),
    ]
    
   
    #Sign up fields
class CustomUser(AbstractBaseUser):
        first_name = models.CharField(max_length=40)
        last_name = models.CharField(max_length=40)
        email = models.EmailField(unique=True)
        role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="general")

        is_staff = models.BooleanField(default=False)
        is_active = models.BooleanField(default=True)

        USERNAME_FIELD = 'email'
        REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

        def get_short_name(self):
            return self.email

        objects = CustomUserManager()
        def __str__(self):
            return f"{self.email} ({self.role})"
    
    #Researcher Profile
class ResearcherProfile(models.Model):
        user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='researcher_profile')
        bio = models.TextField()
        resarch_area = models.CharField(max_length = 100)
        tags = models.JSONField(default=list) #to tstore a list of tag keys

        def __str__(self):
             return f"Researcher Profile - {self.user.email}"
        
        #General Profile
class GeneralProfile(models.Model):
        user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='general_profile')
        age_range = models.CharField(max_length=10, choices =AGE_RANGE_CHOICES)
        interests = models.JSONField(default=list)

        def __str__(self):
             return f"General User Profile - {self.user.email}"
