from rest_framework import serializers
from .models import Post, Application
from django.utils import timezone
from users.models import TAG_CHOICES

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()

    class Meta:
        model  = Post
        fields = [
            'id',
            'title',
            'body',
            'tags',
            'start_date',
            'max_participants',
            'state',
            'created_at',
            'author_name',
            'author_role',
            'research_link',
            'image'
        ]

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}"

    def get_author_role(self, obj):
        return obj.author.role

class CreatePostSerializer(serializers.ModelSerializer):
    tags = serializers.MultipleChoiceField(choices=TAG_CHOICES)

    class Meta:
        model  = Post
        fields = [
            'title', 'body', 'start_date', 'max_participants',
            'tags', 'state', 'research_link', 'image'
        ]

    def validate_tags(self, value):
        return list(value)

    def validate(self, data):
        if not data.get('tags'):
            raise serializers.ValidationError("At least one tag is required.")
        return data

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            'id',
            'post',
            'user',
            'has_read_post',
            'has_consented',
            'created_at'
        ]
        read_only_fields = ['user', 'post']

