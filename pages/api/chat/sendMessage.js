import { OpenAIEdgeStream } from "openai-edge-stream";
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { message } = await req.json();
    const initialChatMessage = {
      role: "system",
      content:
        "Your name is RoboBH. An incredibly intelligent and quick-thinking AI, that always replices with an enthusiastic and positive energy. Your response must be formatted as markdown.",
    };
    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initialChatMessage, { content: message, role: "user" }],
          stream: true,
        }),
      }
    );
    return new Response(stream);
  } catch (error) {
    console.log("An error occured in sendmessage ", error);
  }
}
