from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})


# Add your Recipe model's views/viewset here (see README.md for the
# requirements this app is meant to satisfy) and wire them up in urls.py.
