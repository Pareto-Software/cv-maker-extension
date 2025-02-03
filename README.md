# CV Maker Extension(Software Engineering Project course of Autumn 2024)
## Development

### Gateway

**1. Create .env file at project root**

```bash
cp .env.example .env
```

```
# Supabase
SUPABASE_URL=  # Looks like https://<supabase-project-id>.supabase.co
SUPABASE_KEY= # This is the service account token

# CV import feature
JWT_SECRET=<from supabase api settings page>
OPENAI_STRUCTURED_API_KEY=<apikey here>

# sheet url
SPREADSHEET_ID= # Go to the spreadsheet with your browser and it will be visible on the URL

# Used for restricting access
GENERAL_ROLE_GROUP=asdf
MANAGER_ROLE_GROUP=asdf

# Used model for structured output API
CHATGPT_MODEL=gpt-4o-2024-08-06

# Used model for embedding / its dimensions
EMBEDDING_DIMENSIONS=1536
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=<apikey here>

```

**2. Install dependencies**

```bash
npm install
```

Keep deps up to date with npm-check-updates dep:

```bash
npx npm-check-updates
```

Shows you what it is going to do.

```bash
npx npm-check-updates -u
```

Actually configures package.json to use the suggested updated package versions.
You need to run npm install afterwards for the changes in package.json to change effect.

**3. Run development version**

```bash
npm run start:dev
```

You should see swagger UI on http://localhost:3000/api
Note: Nearly every request requires a valid access token issued by google with appropriate scopes.

### Developing with ChatGPT

Using the development version with ChatGPT requires:

- Proxy that redirects OAuth requests(Nginx proxy)
- Publicly accessible URL(ngrok)
- CustomGPT on ChatGPT portal

**Nginx proxy**

1. Install Docker (https://docs.docker.com/engine/install/)

2. Run nginx reverse proxy using docker:

```bash
docker-compose up
```

3. You should see swagger UI on http://localhost:8080/api

**Ngrok**

https://dashboard.ngrok.com/get-started/setup

1. Click the link and create an account
2. Select your operating system from the top right under Agents
3. Follow the steps. authtoken can be found on left sidebar
4. you should create a static domain:
   <img width="404" alt="image" src="https://github.com/user-attachments/assets/994bcebf-a3e3-44fc-b0fc-f204d536dba4">

5. Run ngrok to expose the reverse proxy to the internet with the command:

```bash
ngrok http --domain=<your static domain here> 8080
```

you should see the app on browser at your ngrok url
(you can see the ngrok url after running ngrok command above, mine is rasmus.ngrok.app like below, but you should have a different one that you created)
<img width="658" alt="image" src="https://github.com/user-attachments/assets/8ed33e1c-a29a-4635-b4c4-6eef895141da">

6. Now you can setup customGPT using the instructions below

## CustomGPT

1. Create customGPT on [ChatGPT](https://chatgpt.com/)(top-right icon > My GPTs > Create a GPT)
2. Create new action
3. Configure OAuth
   Token URL: `https://<url>/token`
   Authorization URL: `https://<url>/token/o/oauth2/v2/auth`
   Scope: `https://www.googleapis.com/auth/spreadsheets.readonly`
   Token Exchange method: `Basic Authorization header`
4. Schema: Import from URL `https://<ngrok_url>/api-yaml`
5. Add the callback visible in ChatGPT to your GCP Project
6. Add the following prompt into the instructions:

```
You are an assistant helping employees of the paretosoftware team get information about the employees allocation. They want information about which employees are available and have certain skills at a given time and you will answer the questions with the data gotten from the endpoints given to you.

Initial Role Check:

    At the beginning of every new chat, always call the role endpoint to determine the user's role. This should be the first action performed.

Role-Based Endpoint Access:

    General Role:
        Users with the general role can access all endpoints except those explicitly requiring the manager role.
        Endpoints not marked as public require appropriate group membership (e.g., general or manager). Assume non-public endpoints without a role marking implicitly require the general role.
        If a user with a general role requests information from an endpoint requiring a manager role, inform them politely that they lack access and avoid calling the endpoint. Instead, consider alternative endpoints to fulfill the request when possible.

    Public Endpoints:
        Public endpoints can be accessed by users without any specific role.

    Manager Role:
        Users with the manager role can access all endpoints, including those requiring a manager role, general role, or marked as public.

Guidance for Restricted Access:

    If the user requests data from an endpoint they cannot access due to their role, provide an informative message explaining the restriction.
    When feasible, attempt to fulfill the user's request by leveraging other accessible endpoints. Avoid unnecessary API calls to restricted endpoints.
```

7. You should be able to make requests to gateway using customGPT
