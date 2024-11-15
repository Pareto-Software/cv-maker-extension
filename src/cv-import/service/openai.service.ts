import { Injectable } from "@nestjs/common";
import { databaseSchema } from '../schema/database-schema';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class OpenAiAPIService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_STRUCTURED_API_KEY,
      temperature: 0,
      maxTokens: 4096,
    });
  }

  async processPdfContent(dataString: String): Promise<any> {
    if (dataString == null || dataString.length < 100) {
      console.log('Data string are contents unplausibly short');
      return;
    }
    try {
      const structuredLlm = this.model.withStructuredOutput(databaseSchema, {
        method: 'jsonSchema',
      });

      const response = await structuredLlm.invoke(
        `Fill information to JSON structure from the following CV files (fill projects and project categories always). If ${dataString}`,
      );

      console.log('Structured output:', response);
      return response;
    } catch (error) {
      console.error('Error fetching CV:', error);
      throw new Error('Failed to process PDF content');
    }
  }
}