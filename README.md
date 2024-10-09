
## Project setup
-> install dependencies
```bash
$ npm install
```
-> setup .env file from telegram
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
```
### setup ngrok for exposing localhost to internet
https://dashboard.ngrok.com/get-started/setup
-> click the link and create an account
-> select your operating system from the top right under Agents(https://dashboard.ngrok.com/get-started/setup)
-> follow the steps. authtoken can be found on left sidebar
-> you should create a static domain:
<img width="404" alt="image" src="https://github.com/user-attachments/assets/994bcebf-a3e3-44fc-b0fc-f204d536dba4">

### run the app through ngrok
```bash
npm run start
```
-> on a separate terminal window run the ngrok:
```bash
ngrok http --domain=<your static domain here> 3000
```
in the above command the 3000 is the port that your app is running locally(npm run start)
-> open up the browser to <your static url> and you should see the app

## Different run modes
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

It probably complains about:
(node:214039) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Issue is being talked about at: https://github.com/vercel/next.js/discussions/66289

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Test routes:
The project has 2 routes for now: Get() and Get('fetch-data'). The fetch-data route makes a 'SELECT * FROM some_table;' query from your local Supabase installation. In order to try it out you need to create a table called 'some_table' and populate it with data from the Supabase web interface or with some other way, like directly connecting to the supabase postgres database with psql.

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
