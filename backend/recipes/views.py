from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Favorite, Recipe
from .serializers import (
    FavoriteRecipeSerializer,
    RecipeCreateSerializer,
    RecipeDetailSerializer,
    RecipeListSerializer,
    RecipeRemixSerializer,
)


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


# --- Auth ---------------------------------------------------------------


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response(
            {"error": "username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "username already taken"}, status=status.HTTP_400_BAD_REQUEST
        )
    user = User(username=username)
    user.set_password(password)
    user.save()
    token = Token.objects.create(user=user)
    return Response(
        {"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED
    )


class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})


# --- Recipes --------------------------------------------------------------


@api_view(["GET", "POST"])
def recipe_list_create(request):
    if request.method == "GET":
        recipes = Recipe.objects.filter(parent__isnull=True)
        serializer = RecipeListSerializer(recipes, many=True)
        return Response(serializer.data)

    if not request.user.is_authenticated:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    serializer = RecipeCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    recipe = serializer.save(author=request.user, parent=None)
    return Response(
        RecipeDetailSerializer(recipe, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def recipe_detail(request, pk):
    recipe = get_object_or_404(Recipe, pk=pk)
    serializer = RecipeDetailSerializer(recipe, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recipe_remix(request, pk):
    forked = get_object_or_404(Recipe, pk=pk)
    serializer = RecipeRemixSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    title = serializer.validated_data.get("title") or forked.title
    remix = serializer.save(
        parent=forked,
        author=request.user,
        title=title,
    )
    return Response(
        RecipeDetailSerializer(remix, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def recipe_favorite(request, pk):
    if request.method == "POST":
        recipe = get_object_or_404(Recipe, pk=pk)
        Favorite.objects.get_or_create(user=request.user, recipe=recipe)
        return Response(status=status.HTTP_200_OK)

    Favorite.objects.filter(user=request.user, recipe_id=pk).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    recipes = Recipe.objects.filter(favorited_by__user=request.user).order_by(
        "-favorited_by__created_at"
    )
    serializer = FavoriteRecipeSerializer(recipes, many=True)
    return Response(serializer.data)
