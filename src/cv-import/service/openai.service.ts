import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { databaseSchema } from '../schema/database-schema.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiAPIService {
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const model = this.configService.get<string>('CHATGPT_MODEL');
    const openAIKey = this.configService.get<string>(
      'OPENAI_STRUCTURED_API_KEY',
    );

    this.model = new ChatOpenAI({
      modelName: model || 'gpt-4o-mini',
      openAIApiKey: openAIKey,
      temperature: 0,
      maxTokens: 4096,
    });
  }

  async textToStructuredJSON(dataString: string): Promise<Record<string, any>> {
    if (dataString == null || dataString.length < 100) {
      console.error('Data string are contents unplausibly short');
      return Promise<null>;
    }
    try {
      const structuredLlm = this.model.withStructuredOutput(databaseSchema, {
        method: 'jsonSchema',
      });

      const response = await structuredLlm.invoke(
        `Fill information to JSON structure from the following CV files (fill projects and project categories always). ${dataString} DATES ARE ALLWAYS YYYY-MM-DD (eg. 2020-06-21). Dates are in project categories and certifications`,
      );

      return response;
    } catch (error) {
      console.error('Error fetching CV:', error);
      throw new Error('Failed to process PDF content');
    }
  }
}
