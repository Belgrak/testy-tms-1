## The client part of the test management system - TestY.

The frontend is implemented in the TypeScript programming language using the [React](https://reactjs.org/)
library and a set of [MUI](https://mui.com/) components.

### Launch in development mode.

For development, you can run the following commands in the root of the frontend directory:

`npm install` - to install dependencies

`npm start` - to launch the application

### Testing the client part.

Implemented end-to-end (E2E) testing using the [cypress](https://www.cypress.io/) library.
For testing, you can use the following commands:

`npm run test:cypress` - run tests in the terminal

`npm run open:cypress` - open the cypress interface for testing with a visual display

### Launch the application in a docker containers.

To run the application in the docker containers, you can run the following command in the root
of the testy-tms directory:

`docker-compose -f docker-compose-dev.yml up`

### Contribute to translations

1) Go to `frontend/src/services/momentTMS.ts` and import locale from moment, like this `import 'moment/locale/en';`
2) Create a translation file `frontend/public/locales/{YOUR_LNG_CODE}/translation.json`
3) Copy content from `frontend/public/locales/en/translation.json` to Your translation file and translate it
   (For example, `"parentKey": {"childKey": "Translation", ...}`).

### Contribute to translations using Weblate

1) Clone the weblate-docker repo:
```
git clone https://github.com/WeblateOrg/docker-compose.git weblate-docker
cd weblate-docker
```
2) Create a `docker-compose.override.yml` file with your settings. See Docker environment variables for full list of environment variables.
```
version: '3'
services:
  weblate:
    ports:
      - 80:8080
    environment:
      WEBLATE_EMAIL_HOST: smtp.example.com
      WEBLATE_EMAIL_HOST_USER: user
      WEBLATE_EMAIL_HOST_PASSWORD: pass
      WEBLATE_SERVER_EMAIL: weblate@example.com
      WEBLATE_DEFAULT_FROM_EMAIL: weblate@example.com
      WEBLATE_SITE_DOMAIN: weblate.example.com
      WEBLATE_ADMIN_PASSWORD: password for the admin user
      WEBLATE_ADMIN_EMAIL: weblate.admin@example.com
```
3) Start Weblate containers:
```
docker-compose up
```
4) Go to http://localhost/ and login using `WEBLATE_ADMIN_EMAIL` and `WEBLATE_ADMIN_PASSWORD` from environment.
5) Add a project by clicking on ‘Add’ at the bottom of the page http://localhost/admin (You must be logged in as admin).
6) Add a component by clicking on ‘Add new translation component’ at the bottom of the page http://localhost/projects/{YOUR_PROJECT_URL_SLUG}/ .
7) Fill the field `Source code repository` with Your fork url, like this https://github.com/Belgrak/testy-tms-1.git
8) Click `Continue` and select `File format JSON nested structure file, File mask frontend/public/locales/*/translation.json`
9) Save it, click `Start new translation` and after translation download JSON translation file.
