import sys
import os

# PythonAnywhere project path
project_home = '/home/5566556/little-world/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment for JWT
os.environ.setdefault('JWT_SECRET', os.urandom(32).hex())

from app import create_app
application = create_app()
