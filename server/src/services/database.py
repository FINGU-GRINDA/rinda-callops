import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.cloud.firestore import AsyncClient, AsyncCollectionReference

from ..core.config import settings
from ..models import (
    Agent, 
    Tool, 
    Call,
    CreateAgentRequest,
    UpdateAgentRequest,
    CreateToolRequest,
    UpdateToolRequest,
)

logger = logging.getLogger(__name__)


class FirebaseService:
    """Service for interacting with Firebase/Firestore"""
    
    def __init__(self):
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key_id": settings.firebase_private_key_id,
                "private_key": settings.firebase_private_key.replace('\\n', '\n'),
                "client_email": settings.firebase_client_email,
                "client_id": settings.firebase_client_id,
                "auth_uri": settings.firebase_auth_uri,
                "token_uri": settings.firebase_token_uri,
                "auth_provider_x509_cert_url": settings.firebase_auth_provider_cert_url,
                "client_x509_cert_url": settings.firebase_client_cert_url
            })
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        self.auth = auth
    
    # Agent Methods
    async def create_agent(self, user_id: str, data: CreateAgentRequest) -> Agent:
        """Create a new agent"""
        agent_ref = self.db.collection('agents').document()
        
        # Create tools first and collect their IDs
        tool_ids = []
        if data.tools:
            for tool_data in data.tools:
                tool_ref = self.db.collection('tools').document()
                tool_doc = {
                    'id': tool_ref.id,
                    'userId': user_id,
                    'agentId': agent_ref.id,
                    'name': tool_data.get('name'),
                    'displayName': tool_data.get('displayName'),
                    'description': tool_data.get('description'),
                    'type': tool_data.get('type', 'function'),
                    'enabled': tool_data.get('enabled', True),
                    'configuration': tool_data.get('configuration'),
                    'jsonSchema': tool_data.get('json_schema'),
                    'usageCount': 0,
                    'lastUsed': None,
                    'createdAt': firestore.SERVER_TIMESTAMP,
                    'updatedAt': firestore.SERVER_TIMESTAMP,
                }
                tool_ref.set(tool_doc)
                tool_ids.append(tool_ref.id)
        
        agent_data = {
            'id': agent_ref.id,
            'userId': user_id,
            'name': data.name,
            'businessName': data.business_name,
            'industry': data.industry,
            'description': data.description,
            'businessType': data.business_type,
            'businessDescription': data.business_description,
            'customRequirements': data.custom_requirements,
            'phoneNumber': data.phone_number,
            'systemPrompt': data.instructions,
            'greeting': data.first_message,
            'firstMessage': data.first_message,
            'voice': data.voice,
            'language': data.language,
            'tools': tool_ids,  # Store tool IDs
            'businessData': data.business_data.dict() if data.business_data else None,
            'settings': data.settings.dict() if data.settings else None,
            'status': 'draft',  # Default to draft for new agents
            'nodes': data.nodes if data.nodes else None,
            'edges': data.edges if data.edges else None,
            'integrations': data.integrations if data.integrations else None,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        agent_ref.set(agent_data)
        
        # Convert to Agent model
        agent_data['id'] = agent_ref.id
        agent_data['createdAt'] = datetime.utcnow()
        agent_data['updatedAt'] = datetime.utcnow()
        
        return Agent(**{
            'id': agent_data['id'],
            'user_id': agent_data['userId'],
            'name': agent_data['name'],
            'business_name': agent_data.get('businessName'),
            'industry': agent_data.get('industry'),
            'description': agent_data.get('description'),
            'business_type': agent_data.get('businessType'),
            'phone_number': agent_data.get('phoneNumber'),
            'instructions': agent_data.get('systemPrompt'),
            'greeting': agent_data.get('greeting'),
            'first_message': agent_data.get('firstMessage'),
            'voice': agent_data.get('voice'),
            'language': agent_data.get('language', 'en-US'),
            'tools': agent_data.get('tools', []),
            'nodes': agent_data.get('nodes'),
            'edges': agent_data.get('edges'),
            'integrations': agent_data.get('integrations'),
            'settings': agent_data.get('settings'),
            'status': agent_data.get('status', 'active'),
            'created_at': agent_data['createdAt'],
            'updated_at': agent_data['updatedAt'],
        })
    
    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID"""
        doc = self.db.collection('agents').document(agent_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        
        return Agent(**{
            'id': data['id'],
            'user_id': data.get('userId', ''),
            'name': data.get('name', ''),
            'business_name': data.get('businessName'),
            'industry': data.get('industry'),
            'description': data.get('description'),
            'business_type': data.get('businessType'),
            'phone_number': data.get('phoneNumber'),
            'instructions': data.get('systemPrompt'),
            'greeting': data.get('greeting'),
            'first_message': data.get('firstMessage'),
            'voice': data.get('voice'),
            'language': data.get('language', 'en-US'),
            'tools': data.get('tools', []),
            'settings': data.get('settings'),
            'nodes': data.get('nodes'),
            'edges': data.get('edges'),
            'integrations': data.get('integrations'),
            'status': data.get('status', 'active'),
            'created_at': data.get('createdAt', datetime.utcnow()),
            'updated_at': data.get('updatedAt', datetime.utcnow()),
        })
    
    async def update_agent(self, agent_id: str, data: UpdateAgentRequest) -> Optional[Agent]:
        """Update an agent"""
        agent_ref = self.db.collection('agents').document(agent_id)
        
        # Get current agent
        doc = agent_ref.get()
        if not doc.exists:
            return None
        
        # Prepare update data
        update_data = {
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        if data.name is not None:
            update_data['name'] = data.name
        if data.business_name is not None:
            update_data['businessName'] = data.business_name
        if data.industry is not None:
            update_data['industry'] = data.industry
        if data.description is not None:
            update_data['description'] = data.description
        if data.business_type is not None:
            update_data['businessType'] = data.business_type
        if data.phone_number is not None:
            update_data['phoneNumber'] = data.phone_number
        if data.instructions is not None:
            update_data['systemPrompt'] = data.instructions
        if data.greeting is not None:
            update_data['greeting'] = data.greeting
        if data.first_message is not None:
            update_data['firstMessage'] = data.first_message
        if data.voice is not None:
            update_data['voice'] = data.voice
        if data.language is not None:
            update_data['language'] = data.language
        if data.tools is not None:
            # Handle tool objects with configuration
            tool_ids = []
            for tool in data.tools:
                if isinstance(tool, dict) and 'id' in tool:
                    tool_id = tool['id']
                    tool_ids.append(tool_id)
                    
                    # Create or update the tool with Google Sheets configuration
                    await self._create_or_update_tool_for_agent(agent_id, tool)
                elif isinstance(tool, str):
                    # Legacy: tool ID string
                    tool_ids.append(tool)
            
            update_data['tools'] = tool_ids
        if data.settings is not None:
            update_data['settings'] = data.settings.dict() if hasattr(data.settings, 'dict') else data.settings
        if data.status is not None:
            update_data['status'] = data.status
        if data.nodes is not None:
            update_data['nodes'] = data.nodes
        if data.edges is not None:
            update_data['edges'] = data.edges
        if data.integrations is not None:
            update_data['integrations'] = data.integrations
        
        agent_ref.update(update_data)
        
        # Return updated agent
        return await self.get_agent(agent_id)
    
    async def _create_or_update_tool_for_agent(self, agent_id: str, tool_data: Dict[str, Any]) -> None:
        """Create or update a tool for an agent with Google Sheets configuration"""
        tool_id = tool_data['id']
        
        # Check if tool already exists
        existing_tool_doc = self.db.collection('tools').document(tool_id).get()
        
        # Prepare tool configuration including Google Sheets data
        tool_config = {
            'id': tool_id,
            'agentId': agent_id,
            'name': tool_data.get('name', tool_id),
            'type': tool_data.get('type', 'reference'),
            'enabled': True,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        # Add JSON schema if present for proper parameter extraction
        if 'json_schema' in tool_data:
            tool_config['jsonSchema'] = tool_data['json_schema']
        
        # Add Google Sheets configuration if present
        if 'googleSheetId' in tool_data:
            tool_config['configuration'] = {
                'googleSheetId': tool_data['googleSheetId'],
                'googleSheetUrl': tool_data['googleSheetUrl'],
                'googleSheetName': tool_data['googleSheetName'],
                'columnMappings': tool_data.get('columnMappings', {}),
                'configured': tool_data.get('configured', True)
            }
        
        # Add menu items if present (for menu tools)
        if 'menuItems' in tool_data:
            tool_config['configuration'] = tool_config.get('configuration', {})
            tool_config['configuration']['menuItems'] = tool_data['menuItems']
        
        # Handle AI-generated tools
        if 'generatedTools' in tool_data and tool_data.get('aiEnhanced'):
            tool_config['generatedTools'] = tool_data['generatedTools']
            tool_config['aiEnhanced'] = True
            tool_config['type'] = 'ai_generated'
            
            # Store the AI-generated tools with their complete configuration
            for generated_tool in tool_data['generatedTools']:
                # Each generated tool becomes a separate tool in the database
                generated_tool_id = f"{agent_id}_{generated_tool.get('name', 'ai_tool')}"
                generated_tool_config = {
                    'id': generated_tool_id,
                    'agentId': agent_id,
                    'userId': tool_config.get('userId'),
                    'name': generated_tool.get('name'),
                    'displayName': generated_tool.get('displayName'),
                    'description': generated_tool.get('description'),
                    'type': generated_tool.get('type', 'function'),
                    'enabled': generated_tool.get('enabled', True),
                    'configuration': generated_tool.get('configuration', {}),
                    'json_schema': generated_tool.get('json_schema', {}),
                    'aiGenerated': True,
                    'updatedAt': firestore.SERVER_TIMESTAMP
                }
                
                # Check if this AI-generated tool already exists
                generated_tool_doc = self.db.collection('tools').document(generated_tool_id).get()
                if generated_tool_doc.exists:
                    self.db.collection('tools').document(generated_tool_id).update(generated_tool_config)
                else:
                    generated_tool_config['createdAt'] = firestore.SERVER_TIMESTAMP
                    self.db.collection('tools').document(generated_tool_id).set(generated_tool_config)
        
        if existing_tool_doc.exists:
            # Update existing tool
            self.db.collection('tools').document(tool_id).update(tool_config)
        else:
            # Create new tool
            tool_config['createdAt'] = firestore.SERVER_TIMESTAMP
            self.db.collection('tools').document(tool_id).set(tool_config)
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent"""
        try:
            self.db.collection('agents').document(agent_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting agent: {str(e)}")
            return False
    
    async def list_agents(
        self, 
        user_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Agent]:
        """List agents with optional filtering"""
        query = self.db.collection('agents')
        
        if user_id:
            query = query.where('userId', '==', user_id)
        
        query = query.order_by('createdAt', direction=firestore.Query.DESCENDING)
        query = query.limit(limit).offset(skip)
        
        docs = query.stream()
        agents = []
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            
            agents.append(Agent(**{
                'id': data['id'],
                'user_id': data.get('userId', ''),
                'name': data.get('name', ''),
                'business_name': data.get('businessName'),
                'industry': data.get('industry'),
                'description': data.get('description'),
                'business_type': data.get('businessType'),
                'phone_number': data.get('phoneNumber'),
                'instructions': data.get('systemPrompt'),
                'greeting': data.get('greeting'),
                'first_message': data.get('firstMessage'),
                'voice': data.get('voice'),
                'language': data.get('language', 'en-US'),
                'tools': data.get('tools', []),
                'settings': data.get('settings'),
                'nodes': data.get('nodes'),
                'edges': data.get('edges'),
                'integrations': data.get('integrations'),
                'status': data.get('status', 'active'),
                'created_at': data.get('createdAt', datetime.utcnow()),
                'updated_at': data.get('updatedAt', datetime.utcnow()),
            }))
        
        return agents
    
    # Tool Methods
    async def create_tool(self, user_id: str, data: CreateToolRequest) -> Tool:
        """Create a new tool"""
        tool_ref = self.db.collection('tools').document()
        
        tool_data = {
            'id': tool_ref.id,
            'userId': user_id,
            'agentId': data.agent_id,
            'name': data.name,
            'displayName': data.display_name,
            'description': data.description,
            'type': data.type,
            'enabled': data.enabled,
            'configuration': data.configuration,
            'config': data.config.dict() if data.config else None,
            'schema': data.schema,
            'usageCount': 0,
            'lastUsed': None,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        tool_ref.set(tool_data)
        
        # Convert to Tool model
        tool_data['id'] = tool_ref.id
        tool_data['createdAt'] = datetime.utcnow()
        tool_data['updatedAt'] = datetime.utcnow()
        
        return Tool(**{
            'id': tool_data['id'],
            'user_id': tool_data['userId'],
            'agent_id': tool_data.get('agentId'),
            'name': tool_data['name'],
            'display_name': tool_data.get('displayName'),
            'description': tool_data['description'],
            'type': tool_data['type'],
            'enabled': tool_data['enabled'],
            'configuration': tool_data.get('configuration'),
            'config': tool_data.get('config'),
            'schema': tool_data.get('schema'),
            'usage_count': tool_data.get('usageCount', 0),
            'last_used': tool_data.get('lastUsed'),
            'created_at': tool_data['createdAt'],
            'updated_at': tool_data['updatedAt'],
        })
    
    async def get_tool(self, tool_id: str) -> Optional[Tool]:
        """Get a tool by ID"""
        doc = self.db.collection('tools').document(tool_id).get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        
        return Tool(**{
            'id': data['id'],
            'user_id': data.get('userId', ''),
            'agent_id': data.get('agentId'),
            'name': data.get('name', ''),
            'display_name': data.get('displayName'),
            'description': data.get('description', ''),
            'type': data.get('type', 'function'),
            'enabled': data.get('enabled', True),
            'configuration': data.get('configuration'),
            'config': data.get('config'),
            'schema': data.get('schema'),
            'usage_count': data.get('usageCount', 0),
            'last_used': data.get('lastUsed'),
            'created_at': data.get('createdAt', datetime.utcnow()),
            'updated_at': data.get('updatedAt', datetime.utcnow()),
        })
    
    async def get_tools_by_agent(self, agent_id: str) -> List[Tool]:
        """Get all tools for a specific agent"""
        query = self.db.collection('tools').where('agentId', '==', agent_id)
        docs = query.stream()
        
        tools = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            
            # Ensure required string fields are never None
            name = data.get('name') or data['id']  # Fallback to ID if name is None/empty
            user_id = data.get('userId') or ""  # Ensure user_id is never None
            description = data.get('description') or ""
            
            tool = Tool(**{
                'id': data['id'],
                'user_id': user_id,
                'agent_id': data.get('agentId'),
                'name': name,
                'display_name': data.get('displayName'),
                'description': description,
                'type': data.get('type', 'function'),
                'enabled': data.get('enabled', True),
                'configuration': data.get('configuration'),
                'config': data.get('config'),
                'schema': data.get('schema'),
                'json_schema': data.get('jsonSchema'),  # Also check for jsonSchema field
                'usage_count': data.get('usageCount', 0),
                'last_used': data.get('lastUsed'),
                'created_at': data.get('createdAt', datetime.utcnow()),
                'updated_at': data.get('updatedAt', datetime.utcnow()),
            })
            tools.append(tool)
        
        return tools
    
    async def update_tool_usage(self, tool_id: str):
        """Update tool usage statistics"""
        tool_ref = self.db.collection('tools').document(tool_id)
        tool_ref.update({
            'usageCount': firestore.Increment(1),
            'lastUsed': firestore.SERVER_TIMESTAMP,
        })
    
    async def get_latest_google_tokens(self) -> Optional[Dict[str, str]]:
        """Get the most recent valid Google OAuth tokens"""
        try:
            # Query the google_auth_tokens collection for the most recent token
            tokens_ref = self.db.collection('google_auth_tokens')
            
            # First, let's see all documents in the collection
            all_docs = list(tokens_ref.stream())
            logger.info(f"🔧 Total documents in google_auth_tokens collection: {len(all_docs)}")
            
            for i, doc in enumerate(all_docs[:3]):  # Show first 3 docs
                doc_data = doc.to_dict()
                logger.info(f"🔧 Token doc {i+1}: ID={doc.id}, keys={list(doc_data.keys())}")
                if 'created_at' in doc_data:
                    logger.info(f"🔧 Created at: {doc_data['created_at']}")
            
            # Try the query
            query = tokens_ref.order_by('created_at', direction=firestore.Query.DESCENDING).limit(1)
            docs = list(query.stream())
            logger.info(f"🔧 Query returned {len(docs)} documents")
            
            if not docs:
                # Try without ordering to see if there are any docs
                all_docs_simple = list(tokens_ref.limit(1).stream())
                logger.info(f"🔧 Simple query returned {len(all_docs_simple)} documents")
                if all_docs_simple:
                    docs = all_docs_simple
                else:
                    logger.warning("🔧 No Google auth tokens found in google_auth_tokens collection")
                    return None
            
            token_data = docs[0].to_dict()
            logger.info(f"🔧 Retrieved token data keys: {list(token_data.keys())}")
            logger.info(f"🔧 Access token present: {bool(token_data.get('access_token'))}")
            logger.info(f"🔧 Refresh token present: {bool(token_data.get('refresh_token'))}")
            
            # Check if token is still valid (not expired)
            import datetime
            if token_data.get('expires_at'):
                expires_at = datetime.datetime.fromtimestamp(token_data['expires_at'] / 1000)
                logger.info(f"🔧 Token expires at: {expires_at}")
                if expires_at < datetime.datetime.now():
                    logger.warning("🔧 Google OAuth token has expired")
                    return None
            
            return {
                'access_token': token_data.get('access_token'),
                'refresh_token': token_data.get('refresh_token')
            }
            
        except Exception as e:
            logger.error(f"Error retrieving Google tokens: {e}")
            return None
    
    # Call Methods
    async def create_call(self, call_data: Dict[str, Any]) -> Call:
        """Create a new call record"""
        call_ref = self.db.collection('calls').document()
        
        call_data['id'] = call_ref.id
        call_data['createdAt'] = firestore.SERVER_TIMESTAMP
        call_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        call_ref.set(call_data)
        
        # Convert to Call model
        call_data['createdAt'] = datetime.utcnow()
        call_data['updatedAt'] = datetime.utcnow()
        
        return Call(**call_data)
    
    async def get_call(self, call_id: str) -> Optional[Call]:
        """Get a call by ID"""
        call_ref = self.db.collection('calls').document(call_id)
        doc = call_ref.get()
        
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        
        return Call(**data)
    
    async def update_call(self, call_id: str, update_data: Dict[str, Any]) -> Optional[Call]:
        """Update a call record"""
        call_ref = self.db.collection('calls').document(call_id)
        
        update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        call_ref.update(update_data)
        
        # Get updated call
        doc = call_ref.get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data['id'] = doc.id
        
        return Call(**data)
    
    # Auth Methods
    async def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            logger.error(f"Error verifying ID token: {str(e)}")
            return None
    
    async def get_user(self, uid: str) -> Optional[auth.UserRecord]:
        """Get user by UID"""
        try:
            user = auth.get_user(uid)
            return user
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    # Additional methods for webhooks
    async def get_calls_by_room(self, room_name: str) -> List[Call]:
        """Get calls by room name"""
        calls_ref = self.db.collection('calls')
        query = calls_ref.where('roomName', '==', room_name)
        docs = query.stream()
        
        calls = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            calls.append(Call(**data))
        
        return calls
    
    async def update_call_status(self, call_id: str, status: str):
        """Update call status"""
        call_ref = self.db.collection('calls').document(call_id)
        call_ref.update({
            'status': status,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
    
    async def update_call_duration(self, call_id: str, duration: int):
        """Update call duration"""
        call_ref = self.db.collection('calls').document(call_id)
        call_ref.update({
            'duration': duration,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
    
    async def track_tool_usage(
        self, 
        tool_id: str, 
        call_id: str, 
        agent_id: str, 
        parameters: Dict[str, Any], 
        result: Dict[str, Any], 
        success: bool
    ):
        """Track tool usage in database"""
        usage_ref = self.db.collection('toolUsage').document()
        
        usage_data = {
            'id': usage_ref.id,
            'toolId': tool_id,
            'callId': call_id,
            'agentId': agent_id,
            'parameters': parameters,
            'result': result,
            'success': success,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'createdAt': firestore.SERVER_TIMESTAMP,
        }
        
        usage_ref.set(usage_data)
    
    async def increment_tool_usage(self, tool_id: str):
        """Increment tool usage count"""
        tool_ref = self.db.collection('tools').document(tool_id)
        tool_ref.update({
            'usageCount': firestore.Increment(1),
            'lastUsed': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })


# Singleton instance
db_service = FirebaseService()


# Dependency for FastAPI
async def get_db() -> FirebaseService:
    return db_service