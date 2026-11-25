from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
    display_avatar = serializers.ReadOnlyField()

    class Meta:
        model = StudentProfile
        fields = [
            'id',
            'role',
            'student_id_number',
            'university',
            'college',
            'degree_program',
            'year_level',
            'contact_number',
            'bio',
            'profile_picture',
            'profile_picture_url',
            'display_avatar',
            'average_rating',
            'total_reviews_count',
            'account_status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['average_rating', 'total_reviews_count', 'account_status', 'role']


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'date_joined',
            'student_profile',
        ]
        read_only_fields = ['is_staff', 'is_superuser', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    student_id_number = serializers.CharField(required=False, allow_blank=True)
    university = serializers.CharField(required=False, default='State Academic University')
    college = serializers.CharField(required=False, allow_blank=True)
    degree_program = serializers.CharField(required=False, allow_blank=True)
    year_level = serializers.CharField(required=False, default='1st Year')
    contact_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'student_id_number',
            'university',
            'college',
            'degree_program',
            'year_level',
            'contact_number',
        ]

    def create(self, validated_data):
        profile_fields = {
            'student_id_number': validated_data.pop('student_id_number', ''),
            'university': validated_data.pop('university', 'State Academic University'),
            'college': validated_data.pop('college', ''),
            'degree_program': validated_data.pop('degree_program', ''),
            'year_level': validated_data.pop('year_level', '1st Year'),
            'contact_number': validated_data.pop('contact_number', ''),
        }

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

        profile = user.student_profile
        for k, v in profile_fields.items():
            setattr(profile, k, v)
        profile.save()

        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

