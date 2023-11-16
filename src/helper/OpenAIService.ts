
import OpenAI from 'openai';
import axios from 'axios';
import { BadRequest, Forbidden, NotFound, Unauthorized } from "@tsed/exceptions";

class OpenAIService {



  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }


    // New method to handle API calls
    private async handleAPICall(question: string): Promise<string> {
      // Example: Determine if the question is about the weather
      if (question.toLowerCase().includes('rate')) {
        // Call the rates api endpoint

        const API_URL = "https://voltaicqbapi.herokuapp.com/CRMRatesInActive";

 
        const headers = {
          "Content-Type": "application/json"
        };

        const response = await axios.post(API_URL, {}, { headers });
        if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");
      
        const data = response.data;
      
        const dataArray = Array.isArray(data) ? data : [data];
      
        console.log(dataArray);
      
        // Map over dataArray and transform its structure
        const results = dataArray.map((project) => {
          return {
            partner: project["fulfillmentPartner"] || null,
            years: project["years"] || null,
            status: project["status"] ||null,
            financing: project["financing"] || null,
            apr: project["apr"] ||null,
            feerate: project["feeRate"] || null,
         
          };
        });


        return JSON.stringify(results);

    
        // return  ????
      }


  
      // Add more conditions for other APIs
      // ...
  
      return "No relevant API call for this question";
    }

  public async askQuestion(question: string): Promise<string> {
    try {
      // Create an OpenAI assistant


        // Check if an API call is needed and get the data
        const apiData = await this.handleAPICall(question);
        if (apiData !== "No relevant API call for this question") {
          // Modify the question to include the API data
          question += `\n\nAPI Data: ${apiData}`;


          console.log(question)
        }


      console.log("Launching Assistant")
      const assistant = await this.openai.beta.assistants.create({
        name: "Construction Company Project Concierge",
        instructions: "You are a personal concierge assistant for a construction company overseeing all project data. Use any resources available to you to consult users about their projects.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4-1106-preview",
      });


      console.log("Creating Thread")
      // Create a thread
      const thread = await this.openai.beta.threads.create();
      console.log("Passing the user question into thread")
      // Pass in the user question into the existing thread
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: question,
      });
      console.log("Starting assistant and waiting for response...")
      // Start the assistant and wait for the response
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      console.log("Poll for the run status until it is completed")

      // Poll for the run status until it's completed
      let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);


      console.log("...run status began...")
      while (runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
      }


      console.log("Returning Messages...")
      const messages = await this.openai.beta.threads.messages.list(thread.id);

      console.log("Last Message for run...")
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