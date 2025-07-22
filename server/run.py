#!/usr/bin/env python
import subprocess
import sys

if __name__ == "__main__":
    subprocess.run([sys.executable, "-m", "uvicorn", "src.main:app", "--reload"])