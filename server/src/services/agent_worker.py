"""
LiveKit Agent Worker Service
Integrates the LiveKit agent worker into the FastAPI application
"""
import asyncio
import logging
from typing import Optional

from livekit import agents
from livekit.agents import JobContext, WorkerOptions

from ..agents.phone_agent import entrypoint as agent_entrypoint
from ..core.config import settings

logger = logging.getLogger(__name__)


class AgentWorkerService:
    """Service to manage the LiveKit agent worker within FastAPI"""
    
    def __init__(self):
        self.worker: Optional[agents.Worker] = None
        self.worker_task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the LiveKit agent worker"""
        try:
            logger.info("Starting LiveKit agent worker...")
            
            # Create worker options with LiveKit configuration
            # Use automatic dispatch (no agent_name) so agent joins any room with participants
            worker_opts = WorkerOptions(
                entrypoint_fnc=agent_entrypoint,
                # agent_name=getattr(settings, 'agent_name', 'phone-agent'),  # Commented out for auto dispatch
                ws_url=settings.livekit_url,
                api_key=settings.livekit_api_key,
                api_secret=settings.livekit_api_secret,
            )
            
            # Create and start the worker
            self.worker = agents.Worker(worker_opts)
            
            # Start the worker in a background task
            self.worker_task = asyncio.create_task(self.worker.run())
            
            logger.info("LiveKit agent worker started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start LiveKit agent worker: {e}")
            raise
    
    async def stop(self):
        """Stop the LiveKit agent worker"""
        try:
            if self.worker_task:
                logger.info("Stopping LiveKit agent worker...")
                self.worker_task.cancel()
                try:
                    await self.worker_task
                except asyncio.CancelledError:
                    pass
                self.worker_task = None
            
            if self.worker:
                await self.worker.aclose()
                self.worker = None
                
            logger.info("LiveKit agent worker stopped")
            
        except Exception as e:
            logger.error(f"Error stopping LiveKit agent worker: {e}")
    
    def is_running(self) -> bool:
        """Check if the worker is running"""
        return self.worker is not None and not (self.worker_task and self.worker_task.done())


# Global instance
agent_worker_service = AgentWorkerService()