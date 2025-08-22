import os

from dotenv import load_dotenv

load_dotenv()

ADHEART_URL_LOGIN = os.getenv("ADHEART_URL_LOGIN")
ADHEART_URL_DASHBOARD = os.getenv("ADHEART_URL_DASHBOARD")
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")
HEADLESS = "true"
STATE_PATH = os.getenv("STATE_PATH", "state.json")