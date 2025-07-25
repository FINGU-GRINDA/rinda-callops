// This file is auto-generated by @hey-api/openapi-ts

/**
 * Agent
 */
export type Agent = {
    /**
     * Id
     */
    id: string;
    /**
     * User Id
     */
    user_id: string;
    /**
     * Name
     */
    name: string;
    /**
     * Business Name
     */
    business_name?: string | null;
    /**
     * Industry
     */
    industry?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Business Type
     */
    business_type?: string | null;
    /**
     * Phone Number Id
     */
    phone_number_id?: string | null;
    /**
     * Phone Number
     */
    phone_number?: string | null;
    /**
     * System Prompt
     */
    system_prompt?: string | null;
    /**
     * Greeting
     */
    greeting?: string | null;
    /**
     * First Message
     */
    first_message?: string | null;
    voice?: Voice | null;
    /**
     * Language
     */
    language?: string;
    /**
     * Tools
     */
    tools?: Array<string>;
    /**
     * Workflows
     */
    workflows?: Array<string>;
    settings?: AgentSettings | null;
    /**
     * Analytics
     */
    analytics?: {
        [key: string]: unknown;
    } | null;
    status?: AgentStatus;
    /**
     * Created At
     */
    created_at?: string;
    /**
     * Updated At
     */
    updated_at?: string;
};

/**
 * AgentSettings
 */
export type AgentSettings = {
    /**
     * Voice Id
     */
    voice_id: string;
    /**
     * Language
     */
    language?: string;
    /**
     * First Message
     */
    first_message: string;
    /**
     * System Prompt
     */
    system_prompt: string;
    /**
     * Max Call Duration
     */
    max_call_duration?: number;
    /**
     * Interruption Threshold
     */
    interruption_threshold?: number;
    /**
     * Voice Temperature
     */
    voice_temperature?: number;
    /**
     * Voice Speed
     */
    voice_speed?: number;
};

/**
 * AgentStatus
 */
export type AgentStatus = 'active' | 'inactive' | 'draft';

/**
 * Body_analyze_files_api_files_analyze_post
 */
export type BodyAnalyzeFilesApiFilesAnalyzePost = {
    /**
     * Files
     */
    files: Array<Blob | File>;
    /**
     * Business Context
     */
    business_context?: string | null;
};

/**
 * Body_generate_smart_tools_api_tools_generate_smart_post
 */
export type BodyGenerateSmartToolsApiToolsGenerateSmartPost = {
    /**
     * File Analysis Results
     */
    file_analysis_results?: Array<{
        [key: string]: unknown;
    }> | null;
    /**
     * Additional Data
     */
    additional_data?: {
        [key: string]: unknown;
    } | null;
};

/**
 * BusinessData
 * Business-specific data for agent creation
 */
export type BusinessData = {
    /**
     * Menu
     */
    menu?: string | null;
    /**
     * Menu Files
     */
    menu_files?: Array<{
        [key: string]: unknown;
    }> | null;
    /**
     * Services
     */
    services?: string | null;
    /**
     * Service Files
     */
    service_files?: Array<{
        [key: string]: unknown;
    }> | null;
    /**
     * Stylists
     */
    stylists?: string | null;
    /**
     * Doctors
     */
    doctors?: string | null;
    /**
     * Insurance Accepted
     */
    insurance_accepted?: string | null;
    /**
     * Hours
     */
    hours?: {
        [key: string]: string;
    } | null;
    /**
     * Additional Info
     */
    additional_info?: string | null;
};

/**
 * CallStatus
 */
export type CallStatus = 'pending' | 'ringing' | 'active' | 'automation' | 'completed' | 'failed' | 'no_answer' | 'busy' | 'voicemail' | 'hangup';

/**
 * CreateAgentRequest
 */
export type CreateAgentRequest = {
    /**
     * Name
     */
    name: string;
    /**
     * Business Name
     */
    business_name?: string | null;
    /**
     * Industry
     */
    industry?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Business Type
     */
    business_type?: string | null;
    /**
     * Business Description
     */
    business_description?: string | null;
    /**
     * Custom Requirements
     */
    custom_requirements?: string | null;
    /**
     * Phone Number
     */
    phone_number?: string | null;
    /**
     * System Prompt
     */
    system_prompt?: string | null;
    /**
     * Greeting
     */
    greeting?: string | null;
    /**
     * First Message
     */
    first_message?: string | null;
    voice?: Voice | null;
    /**
     * Language
     */
    language?: string;
    /**
     * Tools
     */
    tools?: Array<{
        [key: string]: unknown;
    }>;
    business_data?: BusinessData | null;
    settings?: AgentSettings | null;
};

/**
 * CreateInboundCallRequest
 */
export type CreateInboundCallRequest = {
    /**
     * Agent Id
     */
    agent_id: string;
    /**
     * From Number
     */
    from_number: string;
    /**
     * To Number
     */
    to_number: string;
    /**
     * Call Sid
     */
    call_sid: string;
    /**
     * Metadata
     */
    metadata?: {
        [key: string]: unknown;
    } | null;
};

/**
 * CreateOutboundCallRequest
 */
export type CreateOutboundCallRequest = {
    /**
     * Agent Id
     */
    agent_id: string;
    /**
     * To Number
     */
    to_number: string;
    /**
     * From Number
     */
    from_number?: string | null;
    /**
     * Customer Name
     */
    customer_name?: string | null;
    /**
     * Metadata
     */
    metadata?: {
        [key: string]: unknown;
    } | null;
    /**
     * Max Duration
     */
    max_duration?: number | null;
};

/**
 * CreateToolRequest
 */
export type CreateToolRequest = {
    /**
     * Agent Id
     */
    agent_id?: string | null;
    /**
     * Name
     */
    name: string;
    /**
     * Display Name
     */
    display_name?: string | null;
    /**
     * Description
     */
    description: string;
    type: ToolType;
    /**
     * Enabled
     */
    enabled?: boolean;
    /**
     * Configuration
     */
    configuration?: {
        [key: string]: unknown;
    } | null;
    config?: ToolConfigInput | null;
    /**
     * Json Schema
     */
    json_schema?: {
        [key: string]: unknown;
    } | null;
};

/**
 * HTTPValidationError
 */
export type HttpValidationError = {
    /**
     * Detail
     */
    detail?: Array<ValidationError>;
};

/**
 * ParameterType
 */
export type ParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * Tool
 */
export type Tool = {
    /**
     * Id
     */
    id: string;
    /**
     * User Id
     */
    user_id: string;
    /**
     * Agent Id
     */
    agent_id?: string | null;
    /**
     * Name
     */
    name: string;
    /**
     * Display Name
     */
    display_name?: string | null;
    /**
     * Description
     */
    description: string;
    type: ToolType;
    /**
     * Enabled
     */
    enabled?: boolean;
    /**
     * Configuration
     */
    configuration?: {
        [key: string]: unknown;
    } | null;
    config?: ToolConfigOutput | null;
    /**
     * Json Schema
     */
    json_schema?: {
        [key: string]: unknown;
    } | null;
    /**
     * Usage Count
     */
    usage_count?: number;
    /**
     * Last Used
     */
    last_used?: string | null;
    /**
     * Template Id
     */
    template_id?: string | null;
    /**
     * Created At
     */
    created_at?: string;
    /**
     * Updated At
     */
    updated_at?: string;
};

/**
 * ToolConfig
 */
export type ToolConfigInput = {
    /**
     * Sheet Id
     */
    sheet_id?: string | null;
    /**
     * Sheet Url
     */
    sheet_url?: string | null;
    /**
     * Webhook Url
     */
    webhook_url?: string | null;
    /**
     * Api Endpoint
     */
    api_endpoint?: string | null;
    /**
     * Headers
     */
    headers?: {
        [key: string]: string;
    } | null;
    /**
     * Parameters
     */
    parameters?: Array<ToolParameter> | null;
    /**
     * Method
     */
    method?: string | null;
    /**
     * Timeout
     */
    timeout?: number | null;
};

/**
 * ToolConfig
 */
export type ToolConfigOutput = {
    /**
     * Sheet Id
     */
    sheet_id?: string | null;
    /**
     * Sheet Url
     */
    sheet_url?: string | null;
    /**
     * Webhook Url
     */
    webhook_url?: string | null;
    /**
     * Api Endpoint
     */
    api_endpoint?: string | null;
    /**
     * Headers
     */
    headers?: {
        [key: string]: string;
    } | null;
    /**
     * Parameters
     */
    parameters?: Array<ToolParameter> | null;
    /**
     * Method
     */
    method?: string | null;
    /**
     * Timeout
     */
    timeout?: number | null;
};

/**
 * ToolExecutionRequest
 */
export type ToolExecutionRequest = {
    /**
     * Tool Id
     */
    tool_id: string;
    /**
     * Parameters
     */
    parameters: {
        [key: string]: unknown;
    };
    /**
     * Call Id
     */
    call_id?: string | null;
    /**
     * Agent Id
     */
    agent_id?: string | null;
};

/**
 * ToolExecutionResponse
 */
export type ToolExecutionResponse = {
    /**
     * Success
     */
    success: boolean;
    /**
     * Result
     */
    result?: unknown | null;
    /**
     * Error
     */
    error?: string | null;
    /**
     * Execution Time
     */
    execution_time?: number | null;
};

/**
 * ToolParameter
 */
export type ToolParameter = {
    /**
     * Name
     */
    name: string;
    type: ParameterType;
    /**
     * Description
     */
    description: string;
    /**
     * Required
     */
    required?: boolean;
    /**
     * Default
     */
    default?: unknown | null;
    /**
     * Enum
     */
    enum?: Array<string> | null;
};

/**
 * ToolType
 */
export type ToolType = 'sheet_append' | 'sheet_update' | 'sheet_read' | 'calendar_create' | 'sms_send' | 'email_send' | 'custom_api' | 'function' | 'webhook';

/**
 * UpdateAgentRequest
 */
export type UpdateAgentRequest = {
    /**
     * Name
     */
    name?: string | null;
    /**
     * Business Name
     */
    business_name?: string | null;
    /**
     * Industry
     */
    industry?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Business Type
     */
    business_type?: string | null;
    /**
     * Phone Number
     */
    phone_number?: string | null;
    /**
     * System Prompt
     */
    system_prompt?: string | null;
    /**
     * Greeting
     */
    greeting?: string | null;
    /**
     * First Message
     */
    first_message?: string | null;
    voice?: Voice | null;
    /**
     * Language
     */
    language?: string | null;
    /**
     * Tools
     */
    tools?: Array<string> | null;
    settings?: AgentSettings | null;
    status?: AgentStatus | null;
};

/**
 * UpdateToolRequest
 */
export type UpdateToolRequest = {
    /**
     * Name
     */
    name?: string | null;
    /**
     * Display Name
     */
    display_name?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Enabled
     */
    enabled?: boolean | null;
    /**
     * Configuration
     */
    configuration?: {
        [key: string]: unknown;
    } | null;
    config?: ToolConfigInput | null;
    /**
     * Json Schema
     */
    json_schema?: {
        [key: string]: unknown;
    } | null;
};

/**
 * ValidationError
 */
export type ValidationError = {
    /**
     * Location
     */
    loc: Array<string | number>;
    /**
     * Message
     */
    msg: string;
    /**
     * Error Type
     */
    type: string;
};

/**
 * Voice
 */
export type Voice = {
    provider: VoiceProvider;
    /**
     * Voice Id
     */
    voice_id: string;
    /**
     * Voice Name
     */
    voice_name?: string | null;
    /**
     * Temperature
     */
    temperature?: number;
    /**
     * Speed
     */
    speed?: number;
};

/**
 * VoiceProvider
 */
export type VoiceProvider = 'openai' | 'deepgram' | 'cartesia';

export type ListAgentsApiAgentsGetData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Skip
         */
        skip?: number;
        /**
         * Limit
         */
        limit?: number;
        /**
         * User Id
         */
        user_id?: string | null;
    };
    url: '/api/agents/';
};

export type ListAgentsApiAgentsGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ListAgentsApiAgentsGetError = ListAgentsApiAgentsGetErrors[keyof ListAgentsApiAgentsGetErrors];

export type ListAgentsApiAgentsGetResponses = {
    /**
     * Response List Agents Api Agents  Get
     * Successful Response
     */
    200: Array<Agent>;
};

export type ListAgentsApiAgentsGetResponse = ListAgentsApiAgentsGetResponses[keyof ListAgentsApiAgentsGetResponses];

export type CreateAgentApiAgentsPostData = {
    body: CreateAgentRequest;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path?: never;
    query?: never;
    url: '/api/agents/';
};

export type CreateAgentApiAgentsPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateAgentApiAgentsPostError = CreateAgentApiAgentsPostErrors[keyof CreateAgentApiAgentsPostErrors];

export type CreateAgentApiAgentsPostResponses = {
    /**
     * Successful Response
     */
    200: Agent;
};

export type CreateAgentApiAgentsPostResponse = CreateAgentApiAgentsPostResponses[keyof CreateAgentApiAgentsPostResponses];

export type DeleteAgentApiAgentsAgentIdDeleteData = {
    body?: never;
    path: {
        /**
         * Agent Id
         */
        agent_id: string;
    };
    query?: never;
    url: '/api/agents/{agent_id}';
};

export type DeleteAgentApiAgentsAgentIdDeleteErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type DeleteAgentApiAgentsAgentIdDeleteError = DeleteAgentApiAgentsAgentIdDeleteErrors[keyof DeleteAgentApiAgentsAgentIdDeleteErrors];

export type DeleteAgentApiAgentsAgentIdDeleteResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetAgentApiAgentsAgentIdGetData = {
    body?: never;
    path: {
        /**
         * Agent Id
         */
        agent_id: string;
    };
    query?: never;
    url: '/api/agents/{agent_id}';
};

export type GetAgentApiAgentsAgentIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetAgentApiAgentsAgentIdGetError = GetAgentApiAgentsAgentIdGetErrors[keyof GetAgentApiAgentsAgentIdGetErrors];

export type GetAgentApiAgentsAgentIdGetResponses = {
    /**
     * Successful Response
     */
    200: Agent;
};

export type GetAgentApiAgentsAgentIdGetResponse = GetAgentApiAgentsAgentIdGetResponses[keyof GetAgentApiAgentsAgentIdGetResponses];

export type UpdateAgentApiAgentsAgentIdPatchData = {
    body: UpdateAgentRequest;
    path: {
        /**
         * Agent Id
         */
        agent_id: string;
    };
    query?: never;
    url: '/api/agents/{agent_id}';
};

export type UpdateAgentApiAgentsAgentIdPatchErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type UpdateAgentApiAgentsAgentIdPatchError = UpdateAgentApiAgentsAgentIdPatchErrors[keyof UpdateAgentApiAgentsAgentIdPatchErrors];

export type UpdateAgentApiAgentsAgentIdPatchResponses = {
    /**
     * Successful Response
     */
    200: Agent;
};

export type UpdateAgentApiAgentsAgentIdPatchResponse = UpdateAgentApiAgentsAgentIdPatchResponses[keyof UpdateAgentApiAgentsAgentIdPatchResponses];

export type TestAgentCallApiAgentsAgentIdTestCallPostData = {
    body?: never;
    path: {
        /**
         * Agent Id
         */
        agent_id: string;
    };
    query: {
        /**
         * Phone Number
         */
        phone_number: string;
        /**
         * Customer Name
         */
        customer_name?: string | null;
    };
    url: '/api/agents/{agent_id}/test-call';
};

export type TestAgentCallApiAgentsAgentIdTestCallPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type TestAgentCallApiAgentsAgentIdTestCallPostError = TestAgentCallApiAgentsAgentIdTestCallPostErrors[keyof TestAgentCallApiAgentsAgentIdTestCallPostErrors];

export type TestAgentCallApiAgentsAgentIdTestCallPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type ListToolsApiToolsGetData = {
    body?: never;
    path?: never;
    query?: {
        /**
         * Agent Id
         */
        agent_id?: string | null;
        /**
         * Skip
         */
        skip?: number;
        /**
         * Limit
         */
        limit?: number;
    };
    url: '/api/tools/';
};

export type ListToolsApiToolsGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ListToolsApiToolsGetError = ListToolsApiToolsGetErrors[keyof ListToolsApiToolsGetErrors];

export type ListToolsApiToolsGetResponses = {
    /**
     * Response List Tools Api Tools  Get
     * Successful Response
     */
    200: Array<Tool>;
};

export type ListToolsApiToolsGetResponse = ListToolsApiToolsGetResponses[keyof ListToolsApiToolsGetResponses];

export type CreateToolApiToolsPostData = {
    body: CreateToolRequest;
    path?: never;
    query?: never;
    url: '/api/tools/';
};

export type CreateToolApiToolsPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateToolApiToolsPostError = CreateToolApiToolsPostErrors[keyof CreateToolApiToolsPostErrors];

export type CreateToolApiToolsPostResponses = {
    /**
     * Successful Response
     */
    200: Tool;
};

export type CreateToolApiToolsPostResponse = CreateToolApiToolsPostResponses[keyof CreateToolApiToolsPostResponses];

export type DeleteToolApiToolsToolIdDeleteData = {
    body?: never;
    path: {
        /**
         * Tool Id
         */
        tool_id: string;
    };
    query?: never;
    url: '/api/tools/{tool_id}';
};

export type DeleteToolApiToolsToolIdDeleteErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type DeleteToolApiToolsToolIdDeleteError = DeleteToolApiToolsToolIdDeleteErrors[keyof DeleteToolApiToolsToolIdDeleteErrors];

export type DeleteToolApiToolsToolIdDeleteResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetToolApiToolsToolIdGetData = {
    body?: never;
    path: {
        /**
         * Tool Id
         */
        tool_id: string;
    };
    query?: never;
    url: '/api/tools/{tool_id}';
};

export type GetToolApiToolsToolIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetToolApiToolsToolIdGetError = GetToolApiToolsToolIdGetErrors[keyof GetToolApiToolsToolIdGetErrors];

export type GetToolApiToolsToolIdGetResponses = {
    /**
     * Successful Response
     */
    200: Tool;
};

export type GetToolApiToolsToolIdGetResponse = GetToolApiToolsToolIdGetResponses[keyof GetToolApiToolsToolIdGetResponses];

export type UpdateToolApiToolsToolIdPatchData = {
    body: UpdateToolRequest;
    path: {
        /**
         * Tool Id
         */
        tool_id: string;
    };
    query?: never;
    url: '/api/tools/{tool_id}';
};

export type UpdateToolApiToolsToolIdPatchErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type UpdateToolApiToolsToolIdPatchError = UpdateToolApiToolsToolIdPatchErrors[keyof UpdateToolApiToolsToolIdPatchErrors];

export type UpdateToolApiToolsToolIdPatchResponses = {
    /**
     * Successful Response
     */
    200: Tool;
};

export type UpdateToolApiToolsToolIdPatchResponse = UpdateToolApiToolsToolIdPatchResponses[keyof UpdateToolApiToolsToolIdPatchResponses];

export type ExecuteToolApiToolsExecutePostData = {
    body: ToolExecutionRequest;
    path?: never;
    query?: never;
    url: '/api/tools/execute';
};

export type ExecuteToolApiToolsExecutePostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ExecuteToolApiToolsExecutePostError = ExecuteToolApiToolsExecutePostErrors[keyof ExecuteToolApiToolsExecutePostErrors];

export type ExecuteToolApiToolsExecutePostResponses = {
    /**
     * Successful Response
     */
    200: ToolExecutionResponse;
};

export type ExecuteToolApiToolsExecutePostResponse = ExecuteToolApiToolsExecutePostResponses[keyof ExecuteToolApiToolsExecutePostResponses];

export type GenerateSmartToolsApiToolsGenerateSmartPostData = {
    body?: BodyGenerateSmartToolsApiToolsGenerateSmartPost;
    path?: never;
    query: {
        /**
         * Business Type
         */
        business_type: string;
        /**
         * Business Name
         */
        business_name: string;
        /**
         * Business Description
         */
        business_description: string;
        /**
         * Requirements
         */
        requirements: string;
    };
    url: '/api/tools/generate-smart';
};

export type GenerateSmartToolsApiToolsGenerateSmartPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GenerateSmartToolsApiToolsGenerateSmartPostError = GenerateSmartToolsApiToolsGenerateSmartPostErrors[keyof GenerateSmartToolsApiToolsGenerateSmartPostErrors];

export type GenerateSmartToolsApiToolsGenerateSmartPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type CreateOutboundCallApiCallsOutboundPostData = {
    body: CreateOutboundCallRequest;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path?: never;
    query?: never;
    url: '/api/calls/outbound';
};

export type CreateOutboundCallApiCallsOutboundPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateOutboundCallApiCallsOutboundPostError = CreateOutboundCallApiCallsOutboundPostErrors[keyof CreateOutboundCallApiCallsOutboundPostErrors];

export type CreateOutboundCallApiCallsOutboundPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HandleInboundCallApiCallsInboundPostData = {
    body: CreateInboundCallRequest;
    path?: never;
    query?: never;
    url: '/api/calls/inbound';
};

export type HandleInboundCallApiCallsInboundPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type HandleInboundCallApiCallsInboundPostError = HandleInboundCallApiCallsInboundPostErrors[keyof HandleInboundCallApiCallsInboundPostErrors];

export type HandleInboundCallApiCallsInboundPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type ListCallsApiCallsGetData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path?: never;
    query?: {
        /**
         * Agent Id
         */
        agent_id?: string | null;
        /**
         * Status
         */
        status?: CallStatus | null;
        /**
         * Skip
         */
        skip?: number;
        /**
         * Limit
         */
        limit?: number;
    };
    url: '/api/calls/';
};

export type ListCallsApiCallsGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ListCallsApiCallsGetError = ListCallsApiCallsGetErrors[keyof ListCallsApiCallsGetErrors];

export type ListCallsApiCallsGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetCallApiCallsCallIdGetData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/calls/{call_id}';
};

export type GetCallApiCallsCallIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetCallApiCallsCallIdGetError = GetCallApiCallsCallIdGetErrors[keyof GetCallApiCallsCallIdGetErrors];

export type GetCallApiCallsCallIdGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type EndCallApiCallsCallIdEndPostData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/calls/{call_id}/end';
};

export type EndCallApiCallsCallIdEndPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type EndCallApiCallsCallIdEndPostError = EndCallApiCallsCallIdEndPostErrors[keyof EndCallApiCallsCallIdEndPostErrors];

export type EndCallApiCallsCallIdEndPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetCallTranscriptApiCallsCallIdTranscriptGetData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/calls/{call_id}/transcript';
};

export type GetCallTranscriptApiCallsCallIdTranscriptGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetCallTranscriptApiCallsCallIdTranscriptGetError = GetCallTranscriptApiCallsCallIdTranscriptGetErrors[keyof GetCallTranscriptApiCallsCallIdTranscriptGetErrors];

export type GetCallTranscriptApiCallsCallIdTranscriptGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetCallRecordingApiCallsCallIdRecordingGetData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/calls/{call_id}/recording';
};

export type GetCallRecordingApiCallsCallIdRecordingGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetCallRecordingApiCallsCallIdRecordingGetError = GetCallRecordingApiCallsCallIdRecordingGetErrors[keyof GetCallRecordingApiCallsCallIdRecordingGetErrors];

export type GetCallRecordingApiCallsCallIdRecordingGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type AnalyzeFilesApiFilesAnalyzePostData = {
    body: BodyAnalyzeFilesApiFilesAnalyzePost;
    path?: never;
    query?: never;
    url: '/api/files/analyze';
};

export type AnalyzeFilesApiFilesAnalyzePostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type AnalyzeFilesApiFilesAnalyzePostError = AnalyzeFilesApiFilesAnalyzePostErrors[keyof AnalyzeFilesApiFilesAnalyzePostErrors];

export type AnalyzeFilesApiFilesAnalyzePostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HandleTwilioVoiceWebhookApiWebhooksTwilioVoicePostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/webhooks/twilio/voice';
};

export type HandleTwilioVoiceWebhookApiWebhooksTwilioVoicePostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HandleTwilioStatusWebhookApiWebhooksTwilioStatusPostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/webhooks/twilio/status';
};

export type HandleTwilioStatusWebhookApiWebhooksTwilioStatusPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HandleLivekitRoomWebhookApiWebhooksLivekitRoomPostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/webhooks/livekit/room';
};

export type HandleLivekitRoomWebhookApiWebhooksLivekitRoomPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HandleToolWebhookApiWebhooksToolHandlerPostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/webhooks/tool-handler';
};

export type HandleToolWebhookApiWebhooksToolHandlerPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type CreateDispatchApiDispatchCreatePostData = {
    /**
     * Metadata
     */
    body?: {
        [key: string]: unknown;
    } | null;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path?: never;
    query?: {
        /**
         * Agent Name
         */
        agent_name?: string;
        /**
         * Room Name
         */
        room_name?: string | null;
    };
    url: '/api/dispatch/create';
};

export type CreateDispatchApiDispatchCreatePostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateDispatchApiDispatchCreatePostError = CreateDispatchApiDispatchCreatePostErrors[keyof CreateDispatchApiDispatchCreatePostErrors];

export type CreateDispatchApiDispatchCreatePostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetDispatchApiDispatchDispatchIdGetData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Dispatch Id
         */
        dispatch_id: string;
    };
    query?: never;
    url: '/api/dispatch/{dispatch_id}';
};

export type GetDispatchApiDispatchDispatchIdGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetDispatchApiDispatchDispatchIdGetError = GetDispatchApiDispatchDispatchIdGetErrors[keyof GetDispatchApiDispatchDispatchIdGetErrors];

export type GetDispatchApiDispatchDispatchIdGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type CancelDispatchApiDispatchDispatchIdCancelPostData = {
    body?: never;
    headers: {
        /**
         * Authorization
         */
        authorization: string;
    };
    path: {
        /**
         * Dispatch Id
         */
        dispatch_id: string;
    };
    query?: never;
    url: '/api/dispatch/{dispatch_id}/cancel';
};

export type CancelDispatchApiDispatchDispatchIdCancelPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CancelDispatchApiDispatchDispatchIdCancelPostError = CancelDispatchApiDispatchDispatchIdCancelPostErrors[keyof CancelDispatchApiDispatchDispatchIdCancelPostErrors];

export type CancelDispatchApiDispatchDispatchIdCancelPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type CreateWebTestCallApiTestWebCallAgentIdPostData = {
    body?: never;
    headers?: {
        /**
         * Authorization
         */
        authorization?: string | null;
    };
    path: {
        /**
         * Agent Id
         */
        agent_id: string;
    };
    query?: never;
    url: '/api/test/web-call/{agent_id}';
};

export type CreateWebTestCallApiTestWebCallAgentIdPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type CreateWebTestCallApiTestWebCallAgentIdPostError = CreateWebTestCallApiTestWebCallAgentIdPostErrors[keyof CreateWebTestCallApiTestWebCallAgentIdPostErrors];

export type CreateWebTestCallApiTestWebCallAgentIdPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type GetWebTestCallStatusApiTestWebCallCallIdStatusGetData = {
    body?: never;
    headers?: {
        /**
         * Authorization
         */
        authorization?: string | null;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/test/web-call/{call_id}/status';
};

export type GetWebTestCallStatusApiTestWebCallCallIdStatusGetErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type GetWebTestCallStatusApiTestWebCallCallIdStatusGetError = GetWebTestCallStatusApiTestWebCallCallIdStatusGetErrors[keyof GetWebTestCallStatusApiTestWebCallCallIdStatusGetErrors];

export type GetWebTestCallStatusApiTestWebCallCallIdStatusGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type EndWebTestCallApiTestWebCallCallIdEndPostData = {
    body?: never;
    headers?: {
        /**
         * Authorization
         */
        authorization?: string | null;
    };
    path: {
        /**
         * Call Id
         */
        call_id: string;
    };
    query?: never;
    url: '/api/test/web-call/{call_id}/end';
};

export type EndWebTestCallApiTestWebCallCallIdEndPostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type EndWebTestCallApiTestWebCallCallIdEndPostError = EndWebTestCallApiTestWebCallCallIdEndPostErrors[keyof EndWebTestCallApiTestWebCallCallIdEndPostErrors];

export type EndWebTestCallApiTestWebCallCallIdEndPostResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type RootGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/';
};

export type RootGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type HealthHealthGetData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/health';
};

export type HealthHealthGetResponses = {
    /**
     * Successful Response
     */
    200: unknown;
};

export type ClientOptions = {
    baseUrl: 'http://localhost:8000' | (string & {});
};