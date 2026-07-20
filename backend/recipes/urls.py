from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    # Add your recipe endpoints here, e.g.:
    # path("recipes/", RecipeListCreate.as_view()),
    # path("recipes/<int:pk>/", RecipeDetail.as_view()),
    # path("recipes/<int:pk>/remix/", RecipeRemix.as_view()),
]
