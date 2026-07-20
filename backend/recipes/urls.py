from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("auth/register/", views.register, name="auth-register"),
    path("auth/login/", views.LoginView.as_view(), name="auth-login"),
    path("recipes/", views.recipe_list_create, name="recipe-list-create"),
    path("recipes/<int:pk>/", views.recipe_detail, name="recipe-detail"),
    path("recipes/<int:pk>/remix/", views.recipe_remix, name="recipe-remix"),
    path("recipes/<int:pk>/favorite/", views.recipe_favorite, name="recipe-favorite"),
    path("favorites/", views.favorite_list, name="favorite-list"),
]
