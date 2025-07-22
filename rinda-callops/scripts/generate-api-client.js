#!/usr/bin/env node
/**
 * Generate TypeScript API client from FastAPI OpenAPI spec
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'lib');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'api-client.ts');

async function fetchOpenApiSpec() {
  return new Promise((resolve, reject) => {
    const url = `${SERVER_URL}/openapi.json`;
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const spec = JSON.parse(data);
          resolve(spec);
        } catch (error) {
          reject(new Error(`Failed to parse OpenAPI spec: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(new Error(`Failed to fetch OpenAPI spec: ${error.message}`));
    });
  });
}

function convertJsonSchemaToTypeScript(schema, definitions = {}) {
  if (!schema) return 'any';
  
  // Handle references
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    return refName;
  }
  
  // Handle arrays
  if (schema.type === 'array') {
    const itemType = convertJsonSchemaToTypeScript(schema.items, definitions);
    return `${itemType}[]`;
  }
  
  // Handle objects
  if (schema.type === 'object') {
    if (schema.properties) {
      const props = Object.entries(schema.properties).map(([key, propSchema]) => {
        const optional = !schema.required?.includes(key) ? '?' : '';
        const propType = convertJsonSchemaToTypeScript(propSchema, definitions);
        return `  ${toCamelCase(key)}${optional}: ${propType};`;
      });
      return `{\n${props.join('\n')}\n}`;
    }
    return 'Record<string, any>';
  }
  
  // Handle unions (anyOf, oneOf)
  if (schema.anyOf || schema.oneOf) {
    const variants = (schema.anyOf || schema.oneOf).map(variant => 
      convertJsonSchemaToTypeScript(variant, definitions)
    );
    return variants.join(' | ');
  }
  
  // Handle enums
  if (schema.enum) {
    return schema.enum.map(val => `"${val}"`).join(' | ');
  }
  
  // Handle primitive types
  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'any';
  }
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + toCamelCase(str).slice(1);
}

function generateInterfacesFromSchemas(schemas) {
  return Object.entries(schemas).map(([name, schema]) => {
    const properties = schema.properties || {};
    const required = schema.required || [];
    
    const props = Object.entries(properties).map(([key, propSchema]) => {
      const optional = !required.includes(key) ? '?' : '';
      const propType = convertJsonSchemaToTypeScript(propSchema, schemas);
      return `  ${toCamelCase(key)}${optional}: ${propType};`;
    });
    
    return `export interface ${name} {\n${props.join('\n')}\n}`;
  }).join('\n\n');
}

function generateMethodName(method, path) {
  const pathParts = path.split('/').filter(part => part && !part.startsWith('{')).slice(2); // Remove /api prefix
  
  let prefix = '';
  switch (method.toLowerCase()) {
    case 'get':
      prefix = pathParts.length === 1 ? 'list' : 'get';
      break;
    case 'post':
      prefix = 'create';
      break;
    case 'put':
      prefix = 'update';
      break;
    case 'delete':
      prefix = 'delete';
      break;
    case 'patch':
      prefix = 'patch';
      break;
    default:
      prefix = method.toLowerCase();
  }
  
  const resourceName = pathParts.join('');
  return toCamelCase(`${prefix}_${resourceName}`);
}

function extractPathParams(path) {
  const matches = path.match(/\{([^}]+)\}/g);
  return matches ? matches.map(match => match.slice(1, -1)) : [];
}

function generateApiMethods(paths) {
  const methods = [];
  
  Object.entries(paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, operation]) => {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) return;
      
      const methodName = generateMethodName(method, path);
      const pathParams = extractPathParams(path);
      
      // Generate parameters
      const params = [];
      
      // Add path parameters
      pathParams.forEach(param => {
        params.push(`${toCamelCase(param)}: string`);
      });
      
      // Add request body for non-GET methods
      if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        if (path.includes('file')) {
          params.push('file: File');
        } else {
          params.push('data?: any');
        }
      }
      
      // Add query parameters for GET methods
      if (method.toLowerCase() === 'get' && operation.parameters) {
        const queryParams = operation.parameters.filter(p => p.in === 'query');
        if (queryParams.length > 0) {
          params.push('params?: Record<string, any>');
        }
      }
      
      const paramStr = params.join(', ');
      
      // Generate URL template
      let urlTemplate = path;
      pathParams.forEach(param => {
        urlTemplate = urlTemplate.replace(`{${param}}`, `\${${toCamelCase(param)}}`);
      });
      
      // Generate method body
      const hasFileUpload = path.includes('file');
      const hasRequestBody = ['post', 'put', 'patch'].includes(method.toLowerCase());
      
      let bodyCode = '';
      if (hasFileUpload) {
        bodyCode = `
    const formData = new FormData();
    formData.append('file', file);
    options.body = formData;`;
      } else if (hasRequestBody) {
        bodyCode = `
    if (data) {
      options.body = JSON.stringify(data);
    }`;
      }
      
      const contentTypeHeader = hasFileUpload ? '' : hasRequestBody ? 
        `        'Content-Type': 'application/json',` : '';
      
      const queryParamsCode = method.toLowerCase() === 'get' && operation.parameters ? `
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += '?' + queryString;
      }
    }` : '';
      
      const methodCode = `
  async ${methodName}(${paramStr}): Promise<any> {
    let url = \`\${this.baseUrl}${urlTemplate}\`;${queryParamsCode}
    
    const options: RequestInit = {
      method: '${method.toUpperCase()}',
      headers: {
        ...this.getAuthHeaders(),${contentTypeHeader}
      },
    };${bodyCode}
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    return await response.json();
  }`;
      
      methods.push(methodCode);
    });
  });
  
  return methods;
}

async function generateApiClient() {
  try {
    console.log(`Fetching OpenAPI spec from ${SERVER_URL}...`);
    const spec = await fetchOpenApiSpec();
    
    console.log('Generating TypeScript interfaces...');
    const interfaces = generateInterfacesFromSchemas(spec.components?.schemas || {});
    
    console.log('Generating API methods...');
    const methods = generateApiMethods(spec.paths || {});
    
    const content = `// Auto-generated TypeScript API client
// Generated from FastAPI OpenAPI spec at ${SERVER_URL}
// Do not edit this file manually

${interfaces}

// API Response wrapper
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Main API Client
export class PhoneAgentApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  
  constructor(baseUrl: string = '${SERVER_URL}') {
    this.baseUrl = baseUrl;
  }
  
  setAuthToken(token: string) {
    this.authToken = token;
  }
  
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = \`Bearer \${this.authToken}\`;
    }
    return headers;
  }
${methods.join('')}
}

// Default client instance
export const apiClient = new PhoneAgentApiClient();

// Export types for convenience
export * from './api-client';
`;
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Write the generated client
    fs.writeFileSync(OUTPUT_FILE, content);
    
    console.log(`✅ Generated API client with ${Object.keys(spec.components?.schemas || {}).length} types and ${methods.length} methods`);
    console.log(`📝 Saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  generateApiClient();
}

module.exports = { generateApiClient };