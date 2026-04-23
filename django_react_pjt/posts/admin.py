from django.contrib import admin
from .models import Post, Application, Bookmark, Notification

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'body')
    
admin.site.register(Post)
admin.site.register(Application)
admin.site.register(Bookmark)
admin.site.register(Notification)
