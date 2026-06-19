import sys
import os

# PythonAnywhere project path
project_home = '/home/5566556/little-world/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# JWT_SECRET must be set in environment — no fallback
if not os.getenv("JWT_SECRET"):
    raise RuntimeError("JWT_SECRET environment variable is required")

from app import create_app
application = create_app()
