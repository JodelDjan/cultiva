from django.db import models
from django.conf import settings

#from .models import CustomUser, ResearcherProfile, GeneralProfile
# Create your models here.


class Post(models.Model):
    STATE_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
    ]
      
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name = 'posts')
    title = models.CharField(max_length=255)
    body = models.TextField()
    start_date = models.DateField()
    max_participants = models.PositiveIntegerField()
    tags = models.JSONField(default=list)
    state = models.CharField(max_length=10, choices= STATE_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.author.email})"
    
class Application(models.Model):
    

