import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import fs from "fs";
import pdfParse from "pdf-parse";

dotenv.config();

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  openAIApiKey: process.env.API_KEY,
  temperature: 0,
  maxTokens: 4096,
});

// Define the schema using supported types
const databaseSchema = {
  type: "object",
  properties: {
    certifications: {
      type: "array",
      description: "A list of certifications that a person holds.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the certification." },
          received: { type: "string", description: "The date when the certification was received." },
          valid_until: { type: "string", description: "The expiration date of the certification." },
        },
        required: ["name", "received", "valid_until"],
      },
    },
    keywords: {
      type: "array",
      description: "A list of relevant keywords, often associated with skills or expertise areas.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "The keyword or skill name." },
        },
        required: ["name"],
      },
    },
    profiles: {
      type: "array",
      description: "A list of individual profiles containing personal and professional information.",
      items: {
        type: "object",
        properties: {
          email: { type: "string", description: "The individual's email address." },
          first_name: { type: "string", description: "The first name of the individual." },
          last_name: { type: "string", description: "The last name of the individual." },
          title: { type: "string", description: "The professional title or job role of the individual." },
          description: { type: "string", description: "A short biography or description of the individual." },
          education: { type: "string", description: "The educational background of the individual." },
          profile_pic: { type: "string", description: "URL to the individual's profile picture." },
          social_media_links: { type: "string", description: "Links to the individual's social media profiles, if any." },
        },
        required: ["email", "first_name", "last_name"],
      },
    },
    projectCategories: {
      type: "array",
      description: "A list of project catagories, usually meaning companies where project is done",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Usually the name of the company" },
          description: { type: "string", description: "A description of the company" },
          start_date: { type: "string", description: "The start date of this project category." },
          end_date: { type: "string", description: "The end date of this project category." },
          id: { type: "integer", description: "The ID of the project category this project belongs to." },
        },
        required: ["title"],
      },
    },
    projects: {
      type: "array",
      description: "Projects done in specific project category, is related to work experiemce",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the project." },
          description: { type: "string", description: "A brief description of the project." },
          company: { type: "string", description: "The name of the company associated with the project." },
          end_date: { type: "string", description: "The date when the project ended." },
          role: { type: "string", description: "The role of the individual in the project." },
          start_date: { type: "string", description: "The date when the project started." },
          project_category: { type: "integer", description: "The ID of the project category this project belongs to." },
          project_url: { type: "string", description: "URL to the project's webpage or online resource." },
          image_url: { type: "string", description: "URL to an image representing the project." },
        },
        required: ["name", "description", "company", "end_date", "role", "start_date"],
      },
    },
    skills: {
      type: "array",
      description: "A list of skills, each with a level indicating proficiency.",
      items: {
        type: "object",
        properties: {
          skill: { type: "string", description: "The name of the skill." },
          level: { type: "integer", description: "The proficiency level of the skill, typically represented numerically." },
        },
        required: ["skill"],
      },
    },
  },
  required: ["certifications", "keywords", "profiles", "projectCategories", "projects", "skills"],
};

// Function to read PDF and extract text
async function extractTextFromPdf(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

// Function to process the PDF content using the model with supported schema
async function processPdfContent(filePath: string) {
  try {
    const pdfContent = await extractTextFromPdf(filePath);

    const structuredLlm = model.withStructuredOutput(databaseSchema, {
      method: "jsonSchema"
    });

    const response = await structuredLlm.invoke(`Fill information to JSON structure from the following CV file (fill projects and project categories always): ${pdfContent}`);
    //(Fill projectCategories with organisation ie companies and projects are done in these companies)

    console.log("Structured output:", response);
  } catch (error) {
    console.error("Error fetching CV:", error);
  }
}

// Execute the function with your PDF file path
//processPdfContent("C:\\Users\\ranur\\Documents\\työnhaku\\Rami Nurmoranta CV.pdf");
