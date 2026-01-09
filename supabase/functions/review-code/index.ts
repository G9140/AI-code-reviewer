import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReviewRequest {
  id: string;
  code: string;
  language: string;
}

const generateCodeReview = async (code: string, language: string): Promise<{ review: string; suggestions: object[] }> => {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  const prompt = `You are an expert code reviewer. Analyze the following ${language} code and provide:
1. A comprehensive review of the code quality, performance, and best practices
2. Specific suggestions for improvement

Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide your response in the following JSON format:
{
  "review": "A detailed review of the code",
  "suggestions": [
    {
      "title": "Suggestion title",
      "description": "Detailed description",
      "severity": "error|warning|info"
    }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (
    !data.candidates ||
    !data.candidates[0] ||
    !data.candidates[0].content ||
    !data.candidates[0].content.parts ||
    !data.candidates[0].content.parts[0]
  ) {
    throw new Error("Invalid API response structure");
  }

  const content = data.candidates[0].content.parts[0].text;
  let parsedResult;

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[0]);
    } else {
      parsedResult = {
        review: content,
        suggestions: [],
      };
    }
  } catch {
    parsedResult = {
      review: content,
      suggestions: [],
    };
  }

  return parsedResult;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { id, code, language }: ReviewRequest = await req.json();

    if (!id || !code || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { review, suggestions } = await generateCodeReview(code, language);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("code_submissions")
      .update({
        review,
        suggestions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, review, suggestions }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
