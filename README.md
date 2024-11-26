# CV Maker Extension

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

# TODO document this SOME RANDOM UNDEFINED USE, just enter some value
GENERAL_ROLE_GROUP=asdf
MANAGER_ROLE_GROUP=asdf
```

**2. Install dependencies**

```bash
npm install
```

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
6. You should be able to make requests to gateway using customGPT
