
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './client';

export interface AgentIntegration {
  id: string;
  type: 'google' | 'slack' | 'salesforce' | 'hubspot' | 'email';
  platform: string;
  connectionStatus: 'connected' | 'pending' | 'disconnected';
  accessToken?: string;
  refreshToken?: string;
  connectedAt?: Timestamp;
  config?: Record<string, any>;
}

export interface AgentNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface Agent {
  id?: string;
  userId: string;
  name: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  customRequirements?: string;
  instructions: string;
  firstMessage: string;
  voice: string;
  language: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  integrations: AgentIntegration[];
  status: 'draft' | 'testing' | 'deployed';
  phoneNumber?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Save or update agent
export async function saveAgent(agent: Agent): Promise<string> {
  try {
    const agentData = {
      ...agent,
      updatedAt: serverTimestamp(),
    };

    if (agent.id) {
      // Update existing agent
      await updateDoc(doc(db, 'agents', agent.id), agentData);
      return agent.id;
    } else {
      // Create new agent
      const newAgentRef = doc(collection(db, 'agents'));
      await setDoc(newAgentRef, {
        ...agentData,
        id: newAgentRef.id,
        createdAt: serverTimestamp(),
      });
      return newAgentRef.id;
    }
  } catch (error) {
    console.error('Error saving agent:', error);
    throw error;
  }
}

// Get agent by ID
export async function getAgent(agentId: string): Promise<Agent | null> {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    if (agentDoc.exists()) {
      return agentDoc.data() as Agent;
    }
    return null;
  } catch (error) {
    console.error('Error getting agent:', error);
    throw error;
  }
}

// Get all agents for a user
export async function getUserAgents(userId: string): Promise<Agent[]> {
  try {
    const q = query(
      collection(db, 'agents'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Agent);
  } catch (error) {
    console.error('Error getting user agents:', error);
    throw error;
  }
}

// Update agent status
export async function updateAgentStatus(
  agentId: string, 
  status: 'draft' | 'testing' | 'deployed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'agents', agentId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    throw error;
  }
}

// Save integration connection
export async function saveIntegration(
  agentId: string,
  integration: AgentIntegration
): Promise<void> {
  try {
    const agentRef = doc(db, 'agents', agentId);
    const agentDoc = await getDoc(agentRef);
    
    if (agentDoc.exists()) {
      const agent = agentDoc.data() as Agent;
      const integrations = agent.integrations || [];
      
      // Update or add integration
      const existingIndex = integrations.findIndex(i => i.id === integration.id);
      if (existingIndex >= 0) {
        integrations[existingIndex] = {
          ...integrations[existingIndex],
          ...integration,
          connectedAt: serverTimestamp() as Timestamp,
        };
      } else {
        integrations.push({
          ...integration,
          connectedAt: serverTimestamp() as Timestamp,
        });
      }
      
      await updateDoc(agentRef, {
        integrations,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving integration:', error);
    throw error;
  }
}

// Delete agent
export async function deleteAgent(agentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'agents', agentId));
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
}