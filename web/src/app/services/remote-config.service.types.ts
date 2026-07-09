// Value handler for dynamic values
interface ValueHandler {
  source: 'localStorage' | 'window' | 'cookie' | 'environment';
  prop: string;
  prepend?: string;
  append?: string;
  defaultValue?: string;
}

// Data transformation for interceptors
interface InterceptorData {
  target: 'headers' | 'body' | 'params' | 'query';
  key: string;
  valueHandler: ValueHandler;
  condition?: string; // Optional condition expression
}

// Event hook for event bus
interface EventBusHook {
  on: {
    event: string;
    conditions?: Record<string, any>; // Optional conditions
  };
  push: {
    type: 'ANSWER' | 'TRIGGER_ACTION' | 'EMIT_EVENT' | 'CALL_API';
    action?: string; // Required for TRIGGER_ACTION
    payload?: Record<string, any>; // Flexible payload structure
    waitFor?: { event: string; conditions?: Record<string, any> };
  };
  lives: any; //number | 'once' | 'infinite';
  project_id?: string; // Optional project identifier
  include_request?: boolean;
  include_response?: boolean;
}

// Interceptor configuration
interface Interceptor {
  on: 'REQUEST' | 'RESPONSE' | 'ERROR';
  url_pattern: string; // Regex pattern as string
  trigger?: number | string; // For ERROR interceptors (e.g., 403)
  action?: string; // For ERROR interceptors
  data?: InterceptorData[]; // For REQUEST interceptors
  push?: {
    type: 'TRIGGER_ACTION';
    action: string;
    include_request?: boolean;
    include_response?: boolean;
  };
  project_id?: string;
}

// Main remote configuration
interface RemoteConfig {
  event_bus_hooks: EventBusHook[];
  interceptors: Interceptor[];
  todo?: string | string[]; // Development notes
  todo1?: string;
  todo2?: string;
  todo3?: string;
  desc?: string;
  project_id?: string; // Some files might have this at root level
}

// Type guard to check if interceptor is for ERROR
function isErrorInterceptor(interceptor: Interceptor): interceptor is Interceptor & { 
  on: 'ERROR'; 
  trigger: number; 
  action: string; 
} {
  return interceptor.on === 'ERROR' && 
         interceptor.trigger !== undefined && 
         interceptor.action !== undefined;
}

// Type guard to check if interceptor is for REQUEST
function isRequestInterceptor(interceptor: Interceptor): interceptor is Interceptor & { 
  on: 'REQUEST'; 
  data: InterceptorData[]; 
} {
  return interceptor.on === 'REQUEST' && 
         Array.isArray(interceptor.data) && 
         interceptor.data.length > 0;
}

// Type guard to check if interceptor is for RESPONSE with push
function isResponseWithPushInterceptor(interceptor: Interceptor): interceptor is Interceptor & { 
  on: 'RESPONSE'; 
  push: {
    type: 'TRIGGER_ACTION';
    action: string;
    include_request?: boolean;
    include_response?: boolean;
  };
} {
  return interceptor.on === 'RESPONSE' && 
         interceptor.push !== undefined &&
         interceptor.push.type === 'TRIGGER_ACTION';
}

// Type for parsing multiple remote files
type RemoteConfigs = RemoteConfig[];

// Example usage with strict typing
export type {
  RemoteConfig,
  EventBusHook,
  Interceptor,
  InterceptorData,
  ValueHandler,
  RemoteConfigs,
  isErrorInterceptor,
  isRequestInterceptor,
  isResponseWithPushInterceptor
};