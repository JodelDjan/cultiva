from django.db import models
from django.conf import settings

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
    updated_at = models.DateTimeField(auto_now=True)
    research_link = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.author.email})"
    
class Application(models.Model):
    post = models.ForeignKey(
        'Post',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    has_read_post = models.BooleanField(default=False)
    has_consented = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.email} applied to {self.post.title}"

#Bookmarks 
class Bookmark(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='bookmarks'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.email} bookmarked {self.post.title}"
    
#Notifications
class Notification(models.Model):
    user      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message   = models.TextField()
    is_read   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} — {self.message[:50]}"