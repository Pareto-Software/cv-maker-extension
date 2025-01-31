export const databaseSchema = {
  type: 'object',
  required: [
    'certifications',
    'profiles',
    'project_categories',
    'projects',
    'skills',
  ],
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
            description: 'The date when the certification was received. Leave blank if the date is not given.',
          },
          valid_until: {
            type: 'string',
            description: 'The expiration date of the certification. Leave blank if the date is not given.',
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
              type: 'object',
              description: 'The educational background of the individual.',
              properties: {
                school: {
                  type: 'string',
                  description: 'The name of the school.',
                },
                graduationYear: {
                  type: 'string | null',
                  description: 'The year of graduation, if any.',
                },
                degree: {
                  type: 'string',
                  description: 'The degree obtained.',
                },
                field: {
                  type: 'string',
                  description: 'The field of study, if any..',
                },
                thesis: {
                  type: 'string | null',
                  description: 'The title of the thesis, if any.',
                },
              },
              required: ['school', 'graduationYear', 'degree', 'field'],
            },
            profile_pic: {
              type: 'string | null',
              description: "URL to the individual's profile picture, if any.",
            },
            social_media_links: {
              type: 'string | null',
              description:
                "Links to the individual's social media profiles, if any.",
            },
          },
          required: ['email', 'first_name', 'last_name'],
        },
      },
      project_categories: {
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
              description: 'The start date of this project category. Leave blank if the date is not given.',
            },
            end_date: {
              type: 'string',
              description: 'The end date of this project category. Leave blank if the date is not given.',
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
            start_date: {
              type: 'string',
              description: 'The date when the project started. Leave blank if the date is not given.',
            },
            end_date: {
              type: 'string',
              description: 'The date when the project ended. Leave blank if the date is not given.',
            },
            role: {
              type: 'string',
              description: 'The role of the individual in the project.',
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
                'The proficiency level of the skill, if not found mark 3',
            },
          },
          required: ['skill'],
        },
      },
    },
  },
};
