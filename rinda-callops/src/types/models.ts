export interface User {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  business_type?: string;
  phone_number?: string;
  role: 'user' | 'admin';
  subscription?: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due';
    start_date: Date;
    end_date?: Date;
  };
  created_at: Date;
  updated_at: Date;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  business_name?: string;
  business_type?: string;
  business_description?: string;
  instructions?: string;
  first_message?: string;
  voice?: string; // Voice ID from backend
  language?: string;
  status: 'active' | 'inactive' | 'draft';
  created_at: Date;
  updated_at: Date;
}

export interface Tool {
  id: string;
  user_id: string;
  agent_id?: string;
  name: string;
  display_name?: string;
  description: string;
  type: 'function' | 'api_call' | 'database_query' | 'custom';
  enabled?: boolean;
  configuration?: any;
  json_schema?: any; // JSON Schema for parameters
  usage_count?: number;
  last_used?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
}

export interface Workflow {
  id: string;
  user_id: string;
  agent_id: string;
  name: string;
  description?: string;
  trigger: {
    type: 'call_ended' | 'call_started' | 'tool_executed' | 'scheduled' | 'manual';
    config?: any;
  };
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'tool' | 'condition' | 'wait' | 'loop';
  tool_id?: string;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  };
  wait_config?: {
    duration: number; // milliseconds
  };
  loop_config?: {
    count?: number;
    condition?: string;
  };
  next_steps: {
    on_success?: string;
    on_failure?: string;
    default?: string;
  };
}

export interface Call {
  id: string;
  user_id: string;
  agent_id: string;
  type: 'phone' | 'web-test';
  status: 'waiting' | 'queued' | 'in-progress' | 'completed' | 'failed';
  direction: 'inbound' | 'outbound';
  from_number?: string;
  to_number?: string;
  customer_name?: string;
  room_name?: string;
  duration?: number;
  recording_url?: string;
  transcript?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  business_type: string;
  description: string;
  icon?: string;
  system_prompt_template: string;
  greeting_template: string;
  suggested_tools: {
    name: string;
    type: Tool['type'];
    description: string;
    required: boolean;
  }[];
  suggested_workflows: {
    name: string;
    description: string;
    trigger: Workflow['trigger'];
  }[];
  example_questions: string[];
}