# XCloneAPI
This is the backend for XClone, which contains all of the APIs for most of the main functionalities of X/Twitter. This includes logging in/out, creating a post, commenting on a post, following a user, and so on. Creating this backend helped me gain a lot of knowledge on how to handle a social media website like this. This includes how to pass cookies from this backend to the browser to manage the user's authenticated state, how to use Passport.js to provide the login/logout functionality, how to encrypt sensitive info, as well as how to handle the cookie that is sent from the user's browser to the backend on every HTML request. 

## Installation
* Clone the repository using `git clone`
* `cd` into the XCloneAPI directory
* Create a .env file in the root of the project, and add the variables MONGO_URI, JWT_SECRET, and FRONTEND_URL
* MONGO_URI needs to store the connection string for a MongoDB cluster, with the XClone database i.e `MONGO_URI="mongodb+srv://<username>:<password>@cluster0...mongodb.net/XClone?retryWrites=true&w=majority&appName=Cluster0"`
* JWT_SECRET can store any text, preferably a long string, i.e `JWT_SECRET="adw21-23r2r-3t423-hg122"`
* FRONTEND_URL needs to store the base URL for the frontend, with the default frontend local url being http://localhost:5173, i.e `FRONTEND_URL="http://localhost:5173"`
* Run `npm i` to install the required dependencies
* Run `npm run dev` to start the backend on default URL `http://localhost:3000`
