from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    def serialize(self):
        return {
            "username": self.username
        }


class Post(models.Model):
    datetime = models.DateTimeField(auto_now_add=True)
    stop_key = models.CharField(max_length=64)
    title = models.TextField(max_length=1024)
    org = models.TextField(max_length=1024)

    def serialize(self):
        return {
            "org": self.org,
            "title": self.title,
            "stop_key": self.stop_key,
            "datetime": self.datetime,
        }
