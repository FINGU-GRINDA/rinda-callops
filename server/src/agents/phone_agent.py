import asyncio
import json
import logging
from typing import Optional, Dict, Any, Annotated
from time import perf_counter

from livekit import agents, rtc, api
from livekit.agents import llm, AutoSubscribe, JobContext, WorkerOptions, cli, AgentSession, Agent, RoomInputOptions, function_tool, RunContext
from livekit.plugins import openai, deepgram, cartesia, silero, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from ..core.config import settings
from ..core.voice_config import get_cartesia_voice, get_cartesia_language_code
from ..models import Agent as AgentModel, Tool
from ..services.tool_executor import ToolExecutor
# from .custom_tts import PreprocessedTTS  # TODO: Fix this to properly inherit from TTS

logger = logging.getLogger(__name__)


class CallActions(llm.ToolContext):
    """Function context for handling call actions and tools"""
    
    def __init__(
        self,
        *,
        api: api.LiveKitAPI,
        participant: rtc.RemoteParticipant,
        room: rtc.Room,
        agent_config: AgentModel,
        tool_executor: ToolExecutor,
        preloaded_tools: Optional[Dict[str, Any]] = None,
    ):
        # Store instance variables first
        self.api = api
        self.participant = participant
        self.room = room
        self.agent_config = agent_config
        self.tool_executor = tool_executor
        self.preloaded_tools = preloaded_tools or {}
        
        # Build custom tools from agent configuration (loaded from DB)
        tools = []
        
        if agent_config.tools:
            logger.info(f"Loading {len(agent_config.tools)} tools for agent {agent_config.name}")
            for tool_id in agent_config.tools:
                # Create a dynamic tool function for each configured tool from DB
                tool_info = self.preloaded_tools.get(tool_id)
                dynamic_tool = self._create_dynamic_tool(tool_id, tool_info)
                if dynamic_tool:
                    tools.append(dynamic_tool)
                    tool_name = tool_info.name if tool_info else tool_id
                    logger.info(f"✓ Loaded tool: {tool_name} ({tool_id})")
                else:
                    logger.warning(f"✗ Failed to load tool: {tool_id}")
        else:
            logger.warning(f"No tools configured for agent {agent_config.name}")
        
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

    def _create_dynamic_tool(self, tool_id: str, tool_info: Optional[Any] = None):
        """Create a dynamic tool function from tool configuration loaded from DB"""
        try:
            logger.debug(f"Creating dynamic tool for ID: {tool_id}")
            
            # Create a closure to capture tool_id
            def make_tool_func(captured_tool_id: str):
                async def tool_func(context: RunContext):
                    """Execute a custom tool with RunContext"""
                    try:
                        # No parameters needed for menu tools
                        params = {}
                        
                        # Get tool info
                        tool = await self.tool_executor.get_tool(captured_tool_id)
                        if not tool:
                            logger.error(f"Tool {captured_tool_id} not found in database")
                            return {"error": f"Tool {captured_tool_id} not found"}
                        
                        logger.info(f"Executing tool: {tool.name} ({captured_tool_id})")
                        logger.info(f"Tool type: {tool.type}")
                        logger.info(f"Tool description: {tool.description}")
                        logger.info(f"Tool parameters: {params}")
                        
                        # Execute the tool
                        result = await self.tool_executor.execute(captured_tool_id, params)
                        
                        if result.success:
                            logger.info(f"Tool {tool.name} returned successfully")
                            logger.info(f"Tool result type: {type(result.result)}")
                            logger.info(f"Tool result: {result.result}")
                            return result.result
                        else:
                            logger.error(f"Tool {tool.name} failed: {result.error}")
                            return {"error": result.error}
                            
                    except Exception as e:
                        logger.error(f"Error executing tool {captured_tool_id}: {e}")
                        return {"error": f"Tool execution failed: {str(e)}"}
                
                # Set unique function name before returning
                func_name = f"tool_{captured_tool_id.replace('-', '_')}"
                tool_func.__name__ = func_name
                # Create a more descriptive docstring
                tool_func.__doc__ = f"Execute tool {captured_tool_id}. Call this tool to retrieve information."
                
                return tool_func
            
            # Create the function with unique name
            dynamic_func = make_tool_func(tool_id)
            
            # Apply the decorator with proper name and description using current function_tool
            if tool_info:
                # Create a clear, unambiguous description using proper function_tool
                tool_func = function_tool(
                    name=tool_info.name,
                    description=tool_info.description
                )(dynamic_func)
                return tool_func
            else:
                return function_tool()(dynamic_func)
            
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


async def run_realtime_agent(
    ctx: JobContext,
    participant: rtc.RemoteParticipant,
    agent_config: AgentModel,
    tool_executor: ToolExecutor,
):
    """Run the agent using OpenAI Realtime API with MultimodalAgent"""
    
    logger.info("starting agent with OpenAI Realtime API")
    logger.info(f"Agent config: name={agent_config.name}, language={agent_config.language}, voice={agent_config.voice}")

    fnc_ctx = CallActions(
        api=ctx.api,
        participant=participant,
        room=ctx.room,
        agent_config=agent_config,
        tool_executor=tool_executor,
    )

    # Get instructions and initial message
    instructions = agent_config.instructions or "You are a helpful AI assistant."
    
    # Add tool usage instructions
    tool_instructions = """

CRITICAL INSTRUCTIONS FOR TOOL USAGE:

1. NEVER call tools proactively or automatically - ONLY call tools when the user specifically asks for information
2. DO NOT call tools during greetings or initial conversation
3. ONLY call tools when the user explicitly requests specific information like menu, hours, location, etc.
4. When a user asks for information, respond conversationally first, then call the appropriate tool
5. Examples:
   - User: "What's on your menu?" → You: "Let me get our menu for you..." [then call menu tool]
   - User: "What are your hours?" → You: "Let me check our hours..." [then call hours tool]
   - Initial greeting: Just greet - DO NOT call any tools
6. Wait for the user to speak and ask questions before using any tools
"""
    instructions = f"{instructions}{tool_instructions}"
    
    # Add language instruction if needed
    if agent_config.language and agent_config.language != "en-US":
        language_name = {
            "es-ES": "Spanish",
            "fr-FR": "French",
            "de-DE": "German",
            "it-IT": "Italian",
            "pt-BR": "Portuguese",
            "ja-JP": "Japanese",
            "ko-KR": "Korean",
            "zh-CN": "Chinese"
        }.get(agent_config.language, "the requested language")
        instructions = f"{instructions}\n\nIMPORTANT: Always respond in {language_name} only."
    
    initial_message = agent_config.first_message or agent_config.greeting or "Hello! How can I help you today?"
    
    # Map voices to OpenAI Realtime voices
    voice_mapping = {
        "alloy": "alloy",
        "echo": "echo",
        "fable": "shimmer",
        "onyx": "ash", 
        "nova": "ballad",
        "shimmer": "shimmer"
    }
    
    # Get the appropriate voice for OpenAI Realtime
    realtime_voice = voice_mapping.get(agent_config.voice, "alloy")
    logger.info(f"Using OpenAI Realtime voice: {realtime_voice}")
    
    # Connect to room first
    await ctx.connect()
    
    # Create and start the AgentSession with OpenAI Realtime API (v1.0 approach)
    logger.info("Starting AgentSession with OpenAI Realtime API...")
    try:
        # Get the tools from the function context
        agent_tools = fnc_ctx._tools if hasattr(fnc_ctx, '_tools') else []
        logger.info(f"Agent has {len(agent_tools)} tools available")
        
        # Create agent with instructions and tools
        agent = Agent(
            instructions=instructions,
            tools=agent_tools
        )
        
        # Determine Deepgram language for STT
        deepgram_language = "en" if agent_config.language == "en-US" else "multi"
        
        # Import TurnDetection for proper configuration
        from openai.types.beta.realtime.session import TurnDetection
        
        # Create the session with OpenAI Realtime API + proper turn detection
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                voice=realtime_voice,
                model="gpt-4o-realtime-preview",
                modalities=["text", "audio"],
                turn_detection=TurnDetection(
                    type="server_vad",
                    threshold=0.5,
                    prefix_padding_ms=300,
                    silence_duration_ms=500,
                    create_response=True,
                    interrupt_response=True,
                ),
            ),
            stt=deepgram.STT(model="nova-3", language=deepgram_language),
            vad=silero.VAD.load(),
        )
        
        # Start the session
        await session.start(
            room=ctx.room,
            agent=agent,
        )
        
        # Wait longer for audio session to be fully established
        logger.info(f"Waiting for audio session to be ready...")
        await asyncio.sleep(3.0)  # Increased delay to ensure audio is ready
        
        logger.info(f"Sending initial greeting: {initial_message}")
        await session.generate_reply(
            instructions=f"Greet the user by saying: '{initial_message}'"
        )
        logger.info("Initial greeting sent successfully")
        
        logger.info("AgentSession started with OpenAI Realtime API")
        
    except Exception as e:
        logger.error(f"Failed to start AgentSession: {e}")
        raise


async def run_multimodal_agent(
    ctx: JobContext,
    participant: rtc.RemoteParticipant,
    agent_config: AgentModel,
    tool_executor: ToolExecutor,
):
    """Run the multimodal agent using STT-LLM-TTS pipeline"""
    
    logger.info("starting multimodal agent with STT-LLM-TTS pipeline")
    logger.info(f"Agent config: name={agent_config.name}, language={agent_config.language}, voice={agent_config.voice}")

    fnc_ctx = CallActions(
        api=ctx.api,
        participant=participant,
        room=ctx.room,
        agent_config=agent_config,
        tool_executor=tool_executor,
    )

    # Get instructions and initial message
    instructions = agent_config.instructions or "You are a helpful AI assistant."
    
    # Add tool usage instructions to reduce hallucination
    tool_instructions = """

CRITICAL INSTRUCTIONS FOR TOOL USAGE AND NATURAL RESPONSES:

1. ONLY use tools when the customer EXPLICITLY asks for specific information.
2. DO NOT proactively provide information that wasn't requested.
3. NEVER call tools during greetings or unless directly asked.

4. Examples of when to use tools:
   - Customer asks: "What are your hours?" → Use suitable tool
   - Customer asks: "What's on the menu?" → Use suitable tool
   - Customer asks: "How much is a pizza?" → Use suitable tool

5. Examples of when NOT to use tools:
   - Initial greeting
   - Customer says: "Hello" or "Hi"
   - Customer says: "I'd like to order" (wait for them to ask about specific items)

6. CONVERSATIONAL RESPONSE STYLE:
   - When you receive data from a tool, DO NOT just read it robotically
   - Introduce the information naturally: "Great question! Let me tell you about our menu..."
   - Use conversational transitions: "We have...", "Our most popular items are...", "You might enjoy..."
   - Add helpful context: "Our customers really love the...", "A popular choice is..."
   - Be warm and engaging, not just informative
   - Speak like a friendly restaurant employee, not a computer

7. Example natural responses:
   - Instead of: "Here's our menu: Pizza $12.99, Pasta $10.99"
   - Say: "We have some delicious options today! Our pizzas start at $12.99, and we also have fresh pasta dishes from $10.99. What sounds good to you?"

8. NEVER make up information. If asked about something you don't have a tool for, say "Let me check on that for you" or "I'll need to verify that information."
"""
    instructions = f"{instructions}{tool_instructions}"
    
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
        instructions = f"{instructions}\n\nIMPORTANT: Always respond in {language_name} only."
    
    initial_message = agent_config.first_message or agent_config.greeting or "Hello! How can I help you today?"
    
    # Create the agent with instructions
    agent = Agent(
        instructions=instructions,
        tools=fnc_ctx._tools if hasattr(fnc_ctx, '_tools') else []
    )
    
    # Use multi for all non-English languages as Deepgram supports automatic detection
    deepgram_language = "en" if agent_config.language == "en-US" else "multi"
    
    # Get appropriate voice for the language
    if agent_config.voice and isinstance(agent_config.voice, str) and agent_config.voice.startswith(("794", "a0e", "f78", "c79")):
        # If a specific Cartesia voice ID is provided, use it
        voice_id = agent_config.voice
    else:
        # Import the mapping
        from ..core.voice_config import OPENAI_TO_CARTESIA_MAPPING
        
        # Map OpenAI voices to Cartesia voice types
        if agent_config.voice in OPENAI_TO_CARTESIA_MAPPING:
            voice_type = OPENAI_TO_CARTESIA_MAPPING[agent_config.voice]
        elif agent_config.voice in ["male", "female", "professional"]:
            voice_type = agent_config.voice
        else:
            voice_type = "default"
        
        voice_id = get_cartesia_voice(agent_config.language or "en-US", voice_type)
    
    logger.info(f"Selected Cartesia voice: {voice_id} (type: {voice_type}) for language: {agent_config.language}")
    
    # Create TTS directly without preprocessing wrapper for now
    # TODO: Fix PreprocessedTTS to properly inherit from TTS
    try:
        # Check if Cartesia API key is available
        if not settings.cartesia_api_key:
            logger.warning("Cartesia API key not found, falling back to OpenAI TTS")
            tts = openai.TTS(
                model="tts-1",
                voice=agent_config.voice or "alloy"
            )
            logger.info(f"Using OpenAI TTS with voice: {agent_config.voice or 'alloy'}")
        else:
            tts = cartesia.TTS(
                model="sonic-2", 
                voice=voice_id,
                language=get_cartesia_language_code(agent_config.language or "en-US")
            )
            logger.info("Cartesia TTS created successfully")
    except Exception as e:
        logger.error(f"Failed to create TTS: {e}")
        # Try OpenAI as fallback
        try:
            logger.info("Falling back to OpenAI TTS due to Cartesia error")
            tts = openai.TTS(
                model="tts-1",
                voice=agent_config.voice or "alloy"
            )
        except Exception as e2:
            logger.error(f"Failed to create OpenAI TTS as well: {e2}")
            raise
    
    # Create the session with STT-LLM-TTS pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language=deepgram_language),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=tts,
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )
    
    # Start the session with noise cancellation if available
    logger.info("Starting agent session...")
    try:
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        )
        logger.info("Agent session started with noise cancellation")
    except Exception as e:
        logger.warning(f"Could not enable noise cancellation: {e}")
        # Don't try to start again if already started
        if "activity is already running" not in str(e):
            try:
                await session.start(
                    room=ctx.room,
                    agent=agent,
                )
                logger.info("Agent session started without noise cancellation")
            except Exception as e2:
                logger.error(f"Failed to start session: {e2}")
                raise
    
    # Send initial greeting
    logger.info(f"Sending initial greeting: {initial_message}")
    try:
        await session.generate_reply(instructions=initial_message)
        logger.info("Initial greeting sent successfully")
    except Exception as e:
        logger.error(f"Failed to send initial greeting: {e}")
    
    logger.info(f"Agent started with instructions: {instructions[:100]}...")  # Log first 100 chars


async def run_voice_pipeline_agent(
    ctx: JobContext,
    participant: rtc.RemoteParticipant,
    agent_config: AgentModel,
    tool_executor: ToolExecutor,
):
    """Run the voice pipeline agent using STT-LLM-TTS with turn detection"""
    
    logger.info("starting voice pipeline agent with STT-LLM-TTS")

    fnc_ctx = CallActions(
        api=ctx.api,
        participant=participant,
        room=ctx.room,
        agent_config=agent_config,
        tool_executor=tool_executor,
    )

    # Get instructions and initial message
    instructions = agent_config.instructions or "You are a helpful AI assistant."
    
    # Add tool usage instructions to reduce hallucination
    tool_instructions = """

CRITICAL INSTRUCTIONS FOR TOOL USAGE:
1. ONLY use tools when the customer EXPLICITLY asks for specific information.
2. DO NOT proactively provide information that wasn't requested.
3. NEVER call tools during greetings or unless directly asked.
4. Examples of when to use tools:
   - Customer asks: "What are your hours?" → Use suitable tool
   - Customer asks: "What's on the menu?" → Use suitable tool
   - Customer asks: "How much is a pizza?" → Use suitable tool
5. Examples of when NOT to use tools:
   - Initial greeting
   - Customer says: "Hello" or "Hi"
   - Customer says: "I'd like to order" (wait for them to ask about specific items)
6. NEVER make up information. If asked about something you don't have a tool for, say you'll need to check.
"""
    instructions = f"{instructions}{tool_instructions}"
    
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
        instructions = f"{instructions}\n\nIMPORTANT: Always respond in {language_name} only."
    
    initial_message = agent_config.first_message or agent_config.greeting or "Hello! How can I help you today?"
    
    # Create the agent with instructions
    agent = Agent(
        instructions=instructions,
        tools=fnc_ctx._tools if hasattr(fnc_ctx, '_tools') else []
    )
    
    # Use multi for all non-English languages as Deepgram supports automatic detection
    deepgram_language = "en" if agent_config.language == "en-US" else "multi"
    
    # Get appropriate voice for the language
    if agent_config.voice and isinstance(agent_config.voice, str) and agent_config.voice.startswith(("794", "a0e", "f78", "c79")):
        # If a specific Cartesia voice ID is provided, use it
        voice_id = agent_config.voice
    else:
        # Import the mapping
        from ..core.voice_config import OPENAI_TO_CARTESIA_MAPPING
        
        # Map OpenAI voices to Cartesia voice types
        if agent_config.voice in OPENAI_TO_CARTESIA_MAPPING:
            voice_type = OPENAI_TO_CARTESIA_MAPPING[agent_config.voice]
        elif agent_config.voice in ["male", "female", "professional"]:
            voice_type = agent_config.voice
        else:
            voice_type = "default"
        
        voice_id = get_cartesia_voice(agent_config.language or "en-US", voice_type)
    
    logger.info(f"Selected Cartesia voice: {voice_id} (type: {voice_type}) for language: {agent_config.language}")
    
    # Create TTS directly without preprocessing wrapper for now
    # TODO: Fix PreprocessedTTS to properly inherit from TTS
    try:
        # Check if Cartesia API key is available
        if not settings.cartesia_api_key:
            logger.warning("Cartesia API key not found, falling back to OpenAI TTS")
            tts = openai.TTS(
                model="tts-1",
                voice=agent_config.voice or "alloy"
            )
            logger.info(f"Using OpenAI TTS with voice: {agent_config.voice or 'alloy'}")
        else:
            tts = cartesia.TTS(
                model="sonic-2", 
                voice=voice_id,
                language=get_cartesia_language_code(agent_config.language or "en-US")
            )
            logger.info("Cartesia TTS created successfully")
    except Exception as e:
        logger.error(f"Failed to create TTS: {e}")
        # Try OpenAI as fallback
        try:
            logger.info("Falling back to OpenAI TTS due to Cartesia error")
            tts = openai.TTS(
                model="tts-1",
                voice=agent_config.voice or "alloy"
            )
        except Exception as e2:
            logger.error(f"Failed to create OpenAI TTS as well: {e2}")
            raise
    
    # Create the session with STT-LLM-TTS pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language=deepgram_language),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=tts,
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )
    
    # Start the session with noise cancellation
    try:
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        )
        logger.info("Agent session started with noise cancellation")
    except Exception as e:
        logger.warning(f"Could not enable noise cancellation: {e}")
        # Don't try to start again if already started
        if "activity is already running" not in str(e):
            try:
                await session.start(
                    room=ctx.room,
                    agent=agent,
                )
                logger.info("Agent session started without noise cancellation")
            except Exception as e2:
                logger.error(f"Failed to start session: {e2}")
                raise
    
    await ctx.connect()
    
    # Send initial greeting
    await session.generate_reply(instructions=initial_message)
    
    logger.info(f"Voice pipeline agent started with instructions: {instructions[:100]}...")


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
    
    if not agent_id:
        logger.error("No agent_id provided in metadata")
        ctx.shutdown()
        return
    
    # Load agent configuration from database
    from ..services.database import db_service
    agent_config = await db_service.get_agent(agent_id)
    
    if not agent_config:
        logger.error(f"Agent {agent_id} not found in database")
        ctx.shutdown()
        return
    
    logger.info(f"Agent config loaded: name={agent_config.name}, instructions={agent_config.instructions[:50] if agent_config.instructions else 'None'}...")

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
        await run_voice_pipeline_agent(ctx, participant, agent_config, tool_executor)
    else:
        # Use OpenAI Realtime API instead of STT-LLM-TTS pipeline
        await run_realtime_agent(ctx, participant, agent_config, tool_executor)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name=settings.agent_name,
        )
    )