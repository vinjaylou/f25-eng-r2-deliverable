/* eslint-disable */
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateResponse(message: string): Promise<string> {
  if (!message.trim()) {
    return "Please ask a question about a species.";
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheap, fast, excellent for chatbots
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant specialized in answering questions about animals and species. " +
            "Answer questions about habitat, diet, conservation status, and other species facts. " +
            "If a question is unrelated, politely inform the user you only handle species-related queries.",
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
    });

    return completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "Oops, there was an issue generating a response. Please try again later.";
  }
}
