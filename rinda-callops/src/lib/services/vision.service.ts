import { getOpenAIClient } from '@/lib/openai/client';

export interface VisionAnalysisRequest {
  image: string; // base64 encoded image
  prompt: string;
  maxTokens?: number;
  model?: string;
}

export interface VisionAnalysisResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class VisionService {
  /**
   * Analyzes an image using OpenAI's vision capabilities
   * @param request - The vision analysis request containing image and prompt
   * @returns The text response from the AI model
   */
  static async analyzeImage({ 
    image, 
    prompt, 
    maxTokens = 4000,
    model = "gpt-4o-mini" 
  }: VisionAnalysisRequest): Promise<VisionAnalysisResponse> {
    try {
      // Check if we're running on the client side
      if (typeof window !== 'undefined') {
        // Client-side: use API route
        const response = await fetch('/api/vision/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image,
            prompt,
            maxTokens,
            model
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || 'Failed to analyze image');
        }

        return await response.json();
      } else {
        // Server-side: use OpenAI directly
        const openai = getOpenAIClient();
        
        const response = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: prompt 
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: maxTokens,
        });

        return {
          text: response.choices[0]?.message?.content || '',
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined
        };
      }
    } catch (error) {
      console.error('Error analyzing image with OpenAI Vision:', error);
      throw error instanceof Error ? error : new Error('Failed to analyze image');
    }
  }

  /**
   * Converts a File object to base64 string
   * @param file - The file to convert
   * @returns Promise resolving to base64 string (without data URL prefix)
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}