import urllib.request
import urllib.error
import urllib.parse
import json

# 1. Login
login_data = urllib.parse.urlencode({
    "username": "admin@bullwave.com", # wait, I don't know the admin email! Let's guess or check db
    "password": "admin"
}).encode()

# Actually, I can just check the database for an admin token or just query the local db to see what the error is when inserting.
