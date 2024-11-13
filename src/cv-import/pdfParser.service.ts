import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import * as dotenv from 'dotenv';
import * as pdfJs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api.js';

dotenv.config();

/* interface TextItem {
  str: string;
  transform: Array<any>;
  width: number;
  height: number;
  dir: string;
  fontName: string;
  hasEOL: boolean;
} */

@Injectable()
export class PdfParserService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_STRUCTURED_API_KEY,
      temperature: 0,
      maxTokens: 4096,
    });
  }

  async extractTextFromPdf(pdfFile: Express.Multer.File): Promise<string> {
    let fullText = '';

    try {
      const loadingTask = pdfJs.getDocument(new Uint8Array(pdfFile.buffer));
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item): item is TextItem => 'str' in item)
          .map((item) => item.str)
          .join(' ');

        fullText += pageText + '\n';
      }
      console.log(fullText);

      return fullText;
    } catch (e: any) {
      console.log('Error while parsing pdf from buffer:', e);
      return '';
    }
  }

  async processPdfContent(pdfFile: Express.Multer.File): Promise<any> {
    const pdfContent = this.extractTextFromPdf(pdfFile);
    console.log(pdfContent);
    return true;

    /*     try {
      const structuredLlm = this.model.withStructuredOutput(
        this.databaseSchema,
        {
          method: 'jsonSchema',
        },
      );

      const response = await structuredLlm.invoke(
        `Fill information to JSON structure from the following CV file (fill projects and project categories always): ${pdfContent}`,
      );

      console.log('Structured output:', response);
      return response;
    } catch (error) {
      console.error('Error fetching CV:', error);
      throw new Error('Failed to process PDF content');
    } */
  }

  private databaseSchema = {
    type: 'object',
    properties: {
      certifications: {
        type: 'array',
        description: 'A list of certifications that a person holds.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name of the certification.',
            },
            received: {
              type: 'string',
              description: 'The date when the certification was received.',
            },
            valid_until: {
              type: 'string',
              description: 'The expiration date of the certification.',
            },
          },
          required: ['name', 'received', 'valid_until'],
        },
        profiles: {
          type: 'array',
          description:
            'A list of individual profiles containing personal and professional information.',
          items: {
            type: 'object',
            properties: {
              email: {
                type: 'string',
                description: "The individual's email address.",
              },
              first_name: {
                type: 'string',
                description: 'The first name of the individual.',
              },
              last_name: {
                type: 'string',
                description: 'The last name of the individual.',
              },
              title: {
                type: 'string',
                description:
                  'The professional title or job role of the individual.',
              },
              description: {
                type: 'string',
                description:
                  'A short biography or description of the individual.',
              },
              education: {
                type: 'string',
                description: 'The educational background of the individual.',
              },
              profile_pic: {
                type: 'string',
                description: "URL to the individual's profile picture.",
              },
              social_media_links: {
                type: 'string',
                description:
                  "Links to the individual's social media profiles, if any.",
              },
            },
            required: ['email', 'first_name', 'last_name'],
          },
        },
        projectCategories: {
          type: 'array',
          description:
            'A list of project catagories, usually meaning companies where project is done',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Usually the name of the company',
              },
              description: {
                type: 'string',
                description: 'A description of the company',
              },
              start_date: {
                type: 'string',
                description: 'The start date of this project category.',
              },
              end_date: {
                type: 'string',
                description: 'The end date of this project category.',
              },
              id: {
                type: 'integer',
                description:
                  'The ID of the project category this project belongs to.',
              },
            },
            required: ['title'],
          },
        },
        projects: {
          type: 'array',
          description:
            'Projects done in specific project category, is related to work experiemce',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'The name of the project.' },
              description: {
                type: 'string',
                description: 'A brief description of the project.',
              },
              company: {
                type: 'string',
                description:
                  'The name of the company associated with the project.',
              },
              end_date: {
                type: 'string',
                description: 'The date when the project ended.',
              },
              role: {
                type: 'string',
                description: 'The role of the individual in the project.',
              },
              start_date: {
                type: 'string',
                description: 'The date when the project started.',
              },
              project_category: {
                type: 'integer',
                description:
                  'The ID of the project category this project belongs to.',
              },
              project_url: {
                type: 'string',
                description: "URL to the project's webpage or online resource.",
              },
              image_url: {
                type: 'string',
                description: 'URL to an image representing the project.',
              },
              keywords: {
                type: 'string',
                description: 'Keywords for the project',
              },
            },
            required: [
              'name',
              'description',
              'company',
              'end_date',
              'role',
              'start_date',
            ],
          },
        },
        skills: {
          type: 'array',
          description:
            'A list of skills, each with a level indicating proficiency.',
          items: {
            type: 'object',
            properties: {
              skill: { type: 'string', description: 'The name of the skill.' },
              level: {
                type: 'integer',
                description:
                  'The proficiency level of the skill, typically represented numerically.',
              },
            },
            required: ['skill'],
          },
        },
      },
      required: [
        'certifications',
        'keywords',
        'profiles',
        'projectCategories',
        'projects',
        'skills',
      ],
    },
  };
}
