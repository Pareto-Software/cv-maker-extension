import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { databaseSchema } from '../schema/database-schema.js';

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

  async textToStructuredJSON(dataString: String): Promise<Record<string, any>> {
    if (dataString == null || dataString.length < 100) {
      console.error('Data string are contents unplausibly short');
      return Promise<null>;
    }
    try {
      const structuredLlm = this.model.withStructuredOutput(databaseSchema, {
        method: 'jsonSchema',
      });

      const response = await structuredLlm.invoke(
        `Fill information to JSON structure from the following CV files (fill projects and project categories always). If ${dataString}`,
      );

      return response;
    } catch (error) {
      console.error('Error fetching CV:', error);
      throw new Error('Failed to process PDF content');
    }
  }
}
