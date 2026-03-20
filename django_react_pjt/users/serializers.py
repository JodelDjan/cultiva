from rest_framework import serializers
from .models import CustomUser, ResearcherProfile, GeneralProfile

class ResearcherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ResearcherProfile
        fields = ['bio', 'department', 'tags']


class GeneralProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = GeneralProfile
        fields = ['age_range', 'tags']


class SignUpSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True)
    password2        = serializers.CharField(write_only=True)
    manager_profile  = ResearcherProfileSerializer(required=False)
    customer_profile = GeneralProfileSerializer(required=False)

    class Meta:
        model  = CustomUser
        fields = ['first_name', 'last_name', 'email', 'role', 'password', 'password2', 
                  'researcher_profile', 'general_profile']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        manager_data  = validated_data.pop('researcher_profile', None)
        customer_data = validated_data.pop('general_profile', None)
        validated_data.pop('password2')

        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        if manager_data:
            ResearcherProfile.objects.create(user=user, **manager_data)
        if customer_data:
            GeneralProfile.objects.create(user=user, **customer_data)

        return user