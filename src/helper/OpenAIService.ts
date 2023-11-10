
import OpenAI from 'openai';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  public async askQuestion(question: string): Promise<string> {
    try {
      // Create an OpenAI assistant
      const assistant = await this.openai.beta.assistants.create({
        name: "Math Tutor",
        instructions: "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview",
      });

      // Create a thread
      const thread = await this.openai.beta.threads.create();

      // Pass in the user question into the existing thread
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: question,
      });

      // Start the assistant and wait for the response
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      // Poll for the run status until it's completed
      let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
      while (runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const lastMessageForRun = messages.data
        .filter(message => message.run_id === run.id && message.role === "assistant")
        .pop();

      if (lastMessageForRun && 'text' in lastMessageForRun.content[0]) {
        return lastMessageForRun.content[0].text.value;
      } else {
        return "Response format not recognized or no response from assistant";
      }
    } catch (error) {
      console.error(error);
      throw new Error("Error communicating with OpenAI");
    }
  }
}

export const openAIService = new OpenAIService();