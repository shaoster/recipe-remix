from rest_framework import serializers

from .models import Favorite, Recipe


class RecipeListSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Recipe
        fields = ["id", "title", "author"]


class RemixSummarySerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Recipe
        fields = ["id", "title", "remix_note", "author"]


class ParentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["id", "title"]


class RecipeDetailSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    parent = ParentSummarySerializer(read_only=True)
    remixes = RemixSummarySerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            "id",
            "title",
            "ingredients",
            "steps",
            "remix_note",
            "author",
            "created_at",
            "parent",
            "remixes",
            "is_favorited",
        ]

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return Favorite.objects.filter(user=user, recipe=obj).exists()


class RecipeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["title", "ingredients", "steps"]


class RecipeRemixSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["ingredients", "steps", "remix_note"]


class FavoriteRecipeSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    has_parent = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ["id", "title", "author", "has_parent"]

    def get_has_parent(self, obj):
        return obj.parent_id is not None
