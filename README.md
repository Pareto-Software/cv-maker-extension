# Project setup
**1. setup .env file from telegram**
```
# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# google
CLIENT_ID=
CLIENT_SECRET=
AUTHORIZATION_URL=
TOKEN_URL=
SCOPE=
AUTH_METHOD=oauth # other: oauth
SPREADSHEET_ID=
REDIRECT_URL=<your ngrok url here>
GOOGLE_API_KEY=
```
**2. setup ngrok on the website**

  https://dashboard.ngrok.com/get-started/setup
  1. click the link and create an account
  2. select your operating system from the top right under Agents(https://dashboard.ngrok.com/get-started/setup)
  3. follow the steps. authtoken can be found on left sidebar
  4. you should create a static domain:
  <img width="404" alt="image" src="https://github.com/user-attachments/assets/994bcebf-a3e3-44fc-b0fc-f204d536dba4">

# run instructions
1. install docker desktop on your computer and keep it running while developing (https://docs.docker.com/engine/install/)

3. run nginx reverse proxy inside docker container with the command:
```bash
docker-compose up
```
you can keep the container running on other tab while developing

3. run ngrok to expose the reverse proxy to the internet with the command:
```bash
ngrok http --domain=<your static domain here> 3000
```

4. check if installations are available:
```bash
npm install
```

5. run the app
```bash
npm run start
```
you should see the app on browser at your ngrok url
(you can see the ngrok url after running ngrok command above, mine is rasmus.ngrok.app like below, but you should have a different one that you created)
<img width="658" alt="image" src="https://github.com/user-attachments/assets/8ed33e1c-a29a-4635-b4c4-6eef895141da">

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
