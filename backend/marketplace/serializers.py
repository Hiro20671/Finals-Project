from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.serializers import UserSerializer
from .models import Category, AcademicMaterial, MaterialImage, Listing, Review, Report


class CategorySerializer(serializers.ModelSerializer):
    materials_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon_name', 'materials_count', 'created_at']

    def get_materials_count(self, obj):
        return obj.materials.filter(listing__status='AVAILABLE', listing__approval_status='APPROVED').count()


class MaterialImageSerializer(serializers.ModelSerializer):
    display_url = serializers.ReadOnlyField()

    class Meta:
        model = MaterialImage
        fields = ['id', 'image', 'image_url', 'display_url', 'is_primary', 'uploaded_at']


class AcademicMaterialSerializer(serializers.ModelSerializer):
    images = MaterialImageSerializer(many=True, read_only=True)
    primary_image_url = serializers.ReadOnlyField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    owner_details = UserSerializer(source='owner', read_only=True)

    class Meta:
        model = AcademicMaterial
        fields = [
            'id',
            'owner',
            'owner_details',
            'category',
            'category_name',
            'title',
            'author',
            'edition',
            'publication_year',
            'isbn',
            'subject_code',
            'course_name',
            'description',
            'condition',
            'primary_image_url',
            'images',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']


class ListingSerializer(serializers.ModelSerializer):
    material = AcademicMaterialSerializer(read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    condition_display = serializers.CharField(source='material.get_condition_display', read_only=True)
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'material',
            'listing_type',
            'listing_type_display',
            'price',
            'lending_period_days',
            'lending_deposit',
            'exchange_preferences',
            'status',
            'status_display',
            'condition_display',
            'approval_status',
            'rejection_reason',
            'views_count',
            'owner',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['views_count', 'approval_status', 'rejection_reason', 'created_at', 'updated_at']

    def get_owner(self, obj):
        return {
            'id': obj.material.owner.id,
            'username': obj.material.owner.username,
            'full_name': obj.material.owner.get_full_name() or obj.material.owner.username,
            'university': getattr(obj.material.owner.student_profile, 'university', ''),
            'degree_program': getattr(obj.material.owner.student_profile, 'degree_program', ''),
            'average_rating': getattr(obj.material.owner.student_profile, 'average_rating', 5.0),
            'total_reviews_count': getattr(obj.material.owner.student_profile, 'total_reviews_count', 0),
            'avatar': obj.material.owner.student_profile.display_avatar if hasattr(obj.material.owner, 'student_profile') else None,
        }


class CreateListingSerializer(serializers.ModelSerializer):
    # Flattened payload for easy single-step listing creation
    title = serializers.CharField(max_length=255)
    author = serializers.CharField(max_length=255)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), required=False, allow_null=True)
    subject_code = serializers.CharField(max_length=50)
    course_name = serializers.CharField(max_length=200)
    edition = serializers.CharField(max_length=100, required=False, allow_blank=True)
    publication_year = serializers.IntegerField(required=False, allow_null=True)
    isbn = serializers.CharField(max_length=50, required=False, allow_blank=True)
    description = serializers.CharField()
    condition = serializers.ChoiceField(choices=AcademicMaterial.CONDITION_CHOICES, default='GOOD')
    
    # Image support
    image_url = serializers.CharField(max_length=500, required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'author',
            'category',
            'subject_code',
            'course_name',
            'edition',
            'publication_year',
            'isbn',
            'description',
            'condition',
            'image',
            'image_url',
            'listing_type',
            'price',
            'lending_period_days',
            'lending_deposit',
            'exchange_preferences',
            'status',
        ]

    def create(self, validated_data):
        user = self.context['request'].user

        # Extract material fields
        material_data = {
            'owner': user,
            'title': validated_data.pop('title'),
            'author': validated_data.pop('author'),
            'category': validated_data.pop('category', None),
            'subject_code': validated_data.pop('subject_code'),
            'course_name': validated_data.pop('course_name'),
            'edition': validated_data.pop('edition', ''),
            'publication_year': validated_data.pop('publication_year', None),
            'isbn': validated_data.pop('isbn', ''),
            'description': validated_data.pop('description'),
            'condition': validated_data.pop('condition', 'GOOD'),
        }

        image_file = validated_data.pop('image', None)
        image_url = validated_data.pop('image_url', '')

        material = AcademicMaterial.objects.create(**material_data)

        # Attach image if provided
        if image_file or image_url:
            MaterialImage.objects.create(
                material=material,
                image=image_file,
                image_url=image_url,
                is_primary=True
            )

        # Create listing
        listing = Listing.objects.create(
            material=material,
            approval_status='APPROVED', # Auto-approved by default for smooth UX, admin can moderate/reject anytime
            **validated_data
        )

        return listing

    def update(self, instance, validated_data):
        material = instance.material

        # Update material fields if present
        for field in ['title', 'author', 'subject_code', 'course_name', 'edition', 'publication_year', 'isbn', 'description', 'condition', 'category']:
            if field in validated_data:
                setattr(material, field, validated_data.pop(field))
        material.save()

        # Handle image updates
        image_file = validated_data.pop('image', None)
        image_url = validated_data.pop('image_url', None)
        if image_file or image_url:
            img = material.images.filter(is_primary=True).first()
            if not img:
                img = MaterialImage.objects.create(material=material, is_primary=True)
            if image_file:
                img.image = image_file
            if image_url is not None:
                img.image_url = image_url
            img.save()

        # Update listing fields
        for field in ['listing_type', 'price', 'lending_period_days', 'lending_deposit', 'exchange_preferences', 'status']:
            if field in validated_data:
                setattr(instance, field, validated_data.get(field))
        instance.save()

        return instance


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    reviewer_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'reviewer',
            'reviewer_name',
            'reviewer_avatar',
            'reviewed_user',
            'transaction_request',
            'rating',
            'comment',
            'created_at',
        ]
        read_only_fields = ['reviewer', 'created_at']

    def get_reviewer_avatar(self, obj):
        if hasattr(obj.reviewer, 'student_profile'):
            return obj.reviewer.student_profile.display_avatar
        return None


class ReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    listing_title = serializers.CharField(source='reported_listing.material.title', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'reporter_username',
            'reported_user',
            'reported_listing',
            'listing_title',
            'reason',
            'details',
            'status',
            'admin_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['reporter', 'created_at', 'updated_at']

