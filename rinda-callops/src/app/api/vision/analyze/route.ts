import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai/client';

export async function POST(request: NextRequest) {
  try {
    const { image, prompt, maxTokens = 4000, model = "gpt-4o-mini" } = await request.json();
    
    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Missing image or prompt' },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    
    // Call OpenAI Vision API
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

    const text = response.choices[0]?.message?.content || '';
    
    return NextResponse.json({ 
      text,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    });
    
  } catch (error) {
    console.error('Error processing image with OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}