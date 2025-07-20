import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .core.config import settings
from .api import agents, tools, calls, webhooks, dispatch, files, test
from .services.agent_worker import agent_worker_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    logger.info("Starting phone agent server...")
    
    # Start the LiveKit agent worker
    try:
        await agent_worker_service.start()
    except Exception as e:
        logger.error(f"Failed to start agent worker: {e}")
    
    yield
    
    # Stop the LiveKit agent worker
    logger.info("Shutting down phone agent server...")
    await agent_worker_service.stop()


app = FastAPI(
    title="Phone Agent Server",
    description="AI phone agent server using LiveKit",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(tools.router, prefix="/api/tools", tags=["tools"])
app.include_router(calls.router, prefix="/api/calls", tags=["calls"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["dispatch"])
app.include_router(test.router, prefix="/api/test", tags=["test"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Phone Agent Server",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
    )