from django.contrib.auth.models import User
from django.db import models


class Recipe(models.Model):
    title = models.CharField(max_length=200)
    ingredients = models.TextField()
    steps = models.TextField()
    remix_note = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="remixes",
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipes")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "recipe")
