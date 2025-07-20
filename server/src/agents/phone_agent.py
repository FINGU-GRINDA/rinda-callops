import asyncio
import json
import logging
from typing import Optional, Dict, Any, Annotated
from datetime import datetime
from time import perf_counter

from livekit import agents, rtc, api
from livekit.agents import llm, AutoSubscribe, JobContext, WorkerOptions, cli
from livekit.plugins import openai, deepgram, cartesia, silero

from ..core.config import settings
from ..models import Agent, Call, CallStatus, Tool
from ..services.tool_executor import ToolExecutor

logger = logging.getLogger(__name__)


class CallActions(llm.ToolContext):
    """Function context for handling call actions and tools"""
    
    def __init__(
        self,
        *,
        api: api.LiveKitAPI,
        participant: rtc.RemoteParticipant,
        room: rtc.Room,
        agent_config: Agent,
        tool_executor: ToolExecutor,
    ):
        # Store instance variables first
        self.api = api
        self.participant = participant
        self.room = room
        self.agent_config = agent_config
        self.tool_executor = tool_executor
        
        # Build custom tools from agent configuration (loaded from DB)
        tools = []
        
        if agent_config.tools:
            for tool_id in agent_config.tools:
                # Create a dynamic tool function for each configured tool from DB
                dynamic_tool = self._create_dynamic_tool(tool_id)
                if dynamic_tool:
                    tools.append(dynamic_tool)
        
        # Initialize parent with tools
        super().__init__(tools=tools)

    async def hangup(self):
        """End the call"""
        try:
            await self.api.room.remove_participant(
                api.RoomParticipantIdentity(
                    room=self.room.name,
                    identity=self.participant.identity,
                )
            )
        except Exception as e:
            logger.info(f"received error while ending call: {e}")

    @llm.function_tool
    async def end_call(self):
        """Called when the user wants to end the call"""
        logger.info(f"ending the call for {self.participant.identity}")
        await self.hangup()

    @llm.function_tool
    async def look_up_availability(
        self,
        date: Annotated[str, "The date of the appointment to check availability for"],
    ):
        """Called when the user asks about alternative appointment availability"""
        logger.info(f"looking up availability for {self.participant.identity} on {date}")
        await asyncio.sleep(1)  # Simulate API call
        return json.dumps(
            {
                "available_times": ["10:00 AM", "2:00 PM", "4:00 PM"],
                "date": date,
            }
        )

    @llm.function_tool
    async def confirm_appointment(
        self,
        date: Annotated[str, "date of the appointment"],
        time: Annotated[str, "time of the appointment"],
    ):
        """Called when the user confirms their appointment on a specific date"""
        logger.info(
            f"confirming appointment for {self.participant.identity} on {date} at {time}"
        )
        return "Appointment confirmed successfully"

    @llm.function_tool
    async def detected_answering_machine(self):
        """Called when the call reaches voicemail"""
        logger.info(f"detected answering machine for {self.participant.identity}")
        await self.hangup()

    def _create_dynamic_tool(self, tool_id: str):
        """Create a dynamic tool function from tool configuration loaded from DB"""
        try:
            # Create a closure to capture tool_id
            def make_tool_func(captured_tool_id: str):
                async def tool_func(
                    parameters: Annotated[str, "JSON string of parameters for the tool"]
                ):
                    """Execute a custom tool with the provided parameters"""
                    try:
                        # Parse the parameters
                        params = json.loads(parameters) if isinstance(parameters, str) else parameters
                        
                        # Get tool info
                        tool = await self.tool_executor.get_tool(captured_tool_id)
                        if not tool:
                            return {"error": f"Tool {captured_tool_id} not found"}
                        
                        logger.info(f"Executing tool {tool.name} ({captured_tool_id}) with parameters: {params}")
                        
                        # Execute the tool
                        result = await self.tool_executor.execute(captured_tool_id, params)
                        
                        if result.success:
                            return result.result
                        else:
                            return {"error": result.error}
                            
                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid JSON parameters for tool {captured_tool_id}: {e}")
                        return {"error": "Invalid parameter format. Please provide valid JSON."}
                    except Exception as e:
                        logger.error(f"Error executing tool {captured_tool_id}: {e}")
                        return {"error": f"Tool execution failed: {str(e)}"}
                
                # Set unique function name before returning
                func_name = f"tool_{captured_tool_id.replace('-', '_')}"
                tool_func.__name__ = func_name
                tool_func.__doc__ = f"Execute tool {captured_tool_id}"
                
                return tool_func
            
            # Create the function with unique name
            dynamic_func = make_tool_func(tool_id)
            
            # Apply the decorator and return
            return llm.function_tool(dynamic_func)
            
        except Exception as e:
            logger.error(f"Error creating dynamic tool for {tool_id}: {e}")
            return None
    
    async def execute_custom_tool(self, tool_name: str, parameters: Dict[str, Any]):
        """Execute a custom tool defined by the agent"""
        for tool_id in self.agent_config.tools:
            tool = await self.tool_executor.get_tool(tool_id)
            if tool and tool.name == tool_name:
                result = await self.tool_executor.execute(tool_id, parameters)
                return result
        
        return {"error": f"Tool '{tool_name}' not found"}


async def run_multimodal_agent(
    ctx: JobContext,
    participant: rtc.RemoteParticipant,
    agent_config: Agent,
    tool_executor: ToolExecutor,
):
    """Run the multimodal agent using OpenAI's realtime API"""
    
    logger.info("starting multimodal agent")

    # Create OpenAI Realtime model with basic parameters
    model = openai.realtime.RealtimeModel(
        voice=agent_config.voice if isinstance(agent_config.voice, str) else "alloy",
        temperature=0.8,
        modalities=["text", "audio"],
    )

    fnc_ctx = CallActions(
        api=ctx.api,
        participant=participant,
        room=ctx.room,
        agent_config=agent_config,
        tool_executor=tool_executor,
    )

    # Get system prompt and initial message
    system_prompt = agent_config.system_prompt or "You are a helpful AI assistant."
    
    # Add language instruction to system prompt if language is specified
    if agent_config.language:
        language_name = {
            "en-US": "English",
            "es-ES": "Spanish",
            "fr-FR": "French",
            "de-DE": "German",
            "it-IT": "Italian",
            "pt-BR": "Portuguese",
            "ja-JP": "Japanese",
            "ko-KR": "Korean",
            "zh-CN": "Chinese"
        }.get(agent_config.language, "English")
        system_prompt = f"{system_prompt}\n\nIMPORTANT: Always respond in {language_name} only."
    
    initial_message = agent_config.first_message or agent_config.greeting or "Hello! How can I help you today?"
    
    # Create the agent with instructions
    agent = agents.Agent(
        instructions=system_prompt,
        tools=fnc_ctx._tools if hasattr(fnc_ctx, '_tools') else []
    )
    
    # Create the session with the model
    session = agents.AgentSession(
        vad=silero.VAD.load(),  # Voice Activity Detection
        stt=deepgram.STT(),  # Speech-to-text
        llm=model,  # Our OpenAI Realtime model
        tts=openai.TTS(),  # Text-to-speech
    )
    
    # Start the session
    await session.start(agent=agent, room=ctx.room)
    
    # Send initial greeting
    await session.generate_reply(instructions=initial_message)
    
    logger.info(f"Agent started with system prompt: {system_prompt[:100]}...")  # Log first 100 chars


def run_voice_pipeline_agent(
    ctx: JobContext,
    participant: rtc.RemoteParticipant,
    agent_config: Agent,
    tool_executor: ToolExecutor,
):
    """Run the voice pipeline agent for more control over STT/TTS"""
    
    logger.info("starting voice pipeline agent")

    # Set up STT (Speech-to-Text)
    stt = deepgram.STT(
        api_key=settings.deepgram_api_key,
        model="nova-2",
        language=agent_config.language or "en-US",
    )

    # Set up LLM
    llm_model = openai.LLM(
        model="gpt-4o",
        api_key=settings.openai_api_key,
    )

    # Set up TTS (Text-to-Speech)
    voice_id = agent_config.voice if isinstance(agent_config.voice, str) else "alloy"
    
    # For now, always use OpenAI TTS since voice is just a string
    tts = openai.TTS(
        api_key=settings.openai_api_key,
        voice=voice_id,
    )

    fnc_ctx = CallActions(
        api=ctx.api,
        participant=participant,
        room=ctx.room,
        agent_config=agent_config,
        tool_executor=tool_executor,
    )

    agent = agents.voice_pipeline.VoicePipelineAgent(
        stt=stt,
        llm=llm_model,
        tts=tts,
        fnc_ctx=fnc_ctx,
        initial_ctx=llm.ChatContext().append(
            role="system",
            text=agent_config.system_prompt or "You are a helpful AI assistant.",
        ),
        before_llm_cb=lambda ctx: ctx,
        after_llm_cb=lambda ctx: ctx,
    )

    agent.start(ctx.room, participant)

    # Initial greeting
    initial_message = agent_config.first_message or agent_config.greeting or "Hello! How can I help you today?"
    asyncio.create_task(agent.say(initial_message, allow_interruptions=True))


async def wait_for_participant_answer(
    participant: rtc.RemoteParticipant, ctx: JobContext, timeout: int = 30
) -> bool:
    """Wait for participant to answer the call"""
    start_time = perf_counter()
    
    while perf_counter() - start_time < timeout:
        call_status = participant.attributes.get("sip.callStatus")
        
        if call_status == "active":
            logger.info("user has picked up")
            return True
        elif call_status == "automation":
            # During DTMF dialing
            pass
        elif call_status == "hangup":
            logger.info("user hung up, exiting job")
            return False
        
        await asyncio.sleep(0.1)
    
    logger.info("call timed out")
    return False


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the phone agent"""
    
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Get agent configuration from participant metadata
    # Wait for the first participant to join
    participant = await ctx.wait_for_participant()
    
    # Try to get agent_id from participant metadata
    agent_id = None
    if participant and participant.metadata:
        logger.info(f"Participant metadata: {participant.metadata}")
        try:
            import json
            metadata = json.loads(participant.metadata)
            agent_id = metadata.get("agent_id")
            logger.info(f"Extracted agent_id from participant metadata: {agent_id}")
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to parse participant metadata: {e}")
    
    # Fallback to job metadata if no agent_id in participant metadata
    if not agent_id and ctx.job.metadata:
        metadata = ctx.job.metadata
        logger.info(f"Checking job metadata: {metadata}, type: {type(metadata)}")
        
        if isinstance(metadata, str):
            try:
                import json
                metadata = json.loads(metadata)
            except (json.JSONDecodeError, TypeError):
                metadata = {}
        
        agent_id = metadata.get("agent_id") if isinstance(metadata, dict) else None
        logger.info(f"Extracted agent_id from job metadata: {agent_id}")
    
    if agent_id:
        # Load agent configuration from database
        from ..services.database import db_service
        agent_config = await db_service.get_agent(agent_id)
        
        if not agent_config:
            logger.error(f"Agent {agent_id} not found in database")
            ctx.shutdown()
            return
    else:
        # Use default agent configuration for auto-dispatch
        logger.info("No agent_id provided, using default configuration")
        from ..models.agent import Agent
        agent_config = Agent(
            id="default",
            user_id="system",
            name="Default Phone Agent",
            system_prompt="You are a helpful AI assistant. Keep responses brief and conversational.",
            first_message="Hello! How can I help you today?",
            voice="alloy",
            language="en-US",
            tools=[],
            workflows=[],
        )

    # Initialize tool executor
    tool_executor = ToolExecutor()

    # Check if this is an outbound call from job metadata
    is_outbound = False
    phone_number = None
    
    if not agent_id and ctx.job.metadata:
        # Check job metadata for outbound call info
        job_metadata = ctx.job.metadata
        if isinstance(job_metadata, str):
            try:
                import json
                job_metadata = json.loads(job_metadata)
            except:
                job_metadata = {}
        
        if isinstance(job_metadata, dict) and job_metadata.get("phone_number"):
            is_outbound = True
            phone_number = job_metadata["phone_number"]
            outbound_trunk_id = job_metadata.get("trunk_id", getattr(settings, 'twilio_trunk_id', None))
    
    # Handle outbound calls
    if is_outbound and phone_number:
        logger.info(f"dialing {phone_number} to room {ctx.room.name}")
        
        # Create SIP participant
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=outbound_trunk_id,
                sip_call_to=phone_number,
                participant_identity="phone_user",
            )
        )
        
        # Wait for participant
        participant = await ctx.wait_for_participant(identity="phone_user")
        
        # Wait for answer
        if not await wait_for_participant_answer(participant, ctx):
            ctx.shutdown()
            return

    # Choose agent type based on configuration
    # Check if we should use voice pipeline from any metadata source
    use_voice_pipeline = False
    if ctx.job.metadata:
        job_metadata = ctx.job.metadata
        if isinstance(job_metadata, str):
            try:
                import json
                job_metadata = json.loads(job_metadata)
            except:
                job_metadata = {}
        if isinstance(job_metadata, dict):
            use_voice_pipeline = job_metadata.get("use_voice_pipeline", False)
    
    if use_voice_pipeline:
        run_voice_pipeline_agent(ctx, participant, agent_config, tool_executor)
    else:
        await run_multimodal_agent(ctx, participant, agent_config, tool_executor)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name=settings.agent_name,
        )
    )