from django.views.generic import RedirectView
from django.http import HttpResponse
from django.conf import settings
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path(
        "keys/mbta", lambda _: HttpResponse(
            settings.MBTA_API_KEY, content_type="text/plain"
        )
    ),
    path(
        "line-<str:color1>-<int:degrees1>--<str:color2>-<int:degrees2>.svg",
        views.to_lines_svg
    ),
    path(
        "line-<str:color>-<int:degrees>.svg", views.to_line_svg
    ),
    # API Routes
    path("events", views.events, name="events"),
    path("event", views.event, name="event"),
    # Auth
    path("accounts/login/", views.login_view, name="login"),
    path("accounts/logout/", views.logout_view, name="logout"),
    path("accounts/register/", views.register, name="register"),
]
