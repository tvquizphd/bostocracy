from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json

from .icons import to_line, to_lines
from .models import User, Post


def to_line_svg(request, **kwargs):
    return n_lines(1)(request, **kwargs)


def to_lines_svg(request, **kwargs):
    return n_lines(2)(request, **kwargs)


@csrf_protect
@login_required
def event(request):

    if request.method != "POST":
        return JsonResponse({
            "error": "Invalid HTTP request method."
        }, status=400)

    data = json.loads(request.body)
    body = data.get("body", "")
    post = Post(
        org=data.get("org", ""),
        title=data.get("title", ""),
        stop_key=data.get("stop_key", ""),
        datetime=data.get("datetime", "")
    )
    post.save()
    return JsonResponse({"message": "Posted"}, status=201)


def events(request):

    if request.method != "GET":
        return JsonResponse({
            "error": "Invalid HTTP request method."
        }, status=400)

    posts = Post.objects.all()
    posts = posts.order_by("-datetime").all()
    return JsonResponse(
        [post.serialize() for post in posts], safe=False
    )


def n_lines(n):

    def to_svg(request, **kwargs):

        if request.method != "GET":
            return JsonResponse({
                "error": "Invalid HTTP request method."
            }, status=400)

        svg = ""
        if n == 1:
            svg = to_line(kwargs["color"], kwargs["degrees"])
        else:
            svg = to_lines(
                kwargs["color1"], kwargs["degrees1"],
                kwargs["color2"], kwargs["degrees2"]
            )

        return HttpResponse(
            svg, content_type="image/svg+xml"
        )

    return to_svg


def index(request):
    return render(request, "bostocracy/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "bostocracy/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "bostocracy/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "bostocracy/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "bostocracy/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "bostocracy/register.html")
