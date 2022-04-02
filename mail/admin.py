from django.contrib import admin

from mail.models import Email, User

# Register your models here.

admin.site.register(User)
admin.site.register(Email)