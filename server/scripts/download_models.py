#!/usr/bin/env python
"""
Download required model files for turn detector and VAD
"""
import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_models():
    """Download model files using the phone agent"""
    logger.info("Downloading model files for turn detector and VAD...")
    
    try:
        # Run the download-files command through the phone agent
        cmd = [sys.executable, "-m", "src.agents.phone_agent", "download-files"]
        result = subprocess.run(cmd, cwd="/root/phone-ag/server", capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Failed to download models: {result.stderr}")
            return False
            
        logger.info("Model files downloaded successfully!")
        logger.info(result.stdout)
        return True
        
    except Exception as e:
        logger.error(f"Error downloading models: {e}")
        return False

if __name__ == "__main__":
    success = download_models()
    sys.exit(0 if success else 1)