# worker/main.py

import asyncio

from browser import start_browser_session

from .interceptors import handle_creatives

if __name__ == "__main__":
    asyncio.run(start_browser_session(handle_creatives))
