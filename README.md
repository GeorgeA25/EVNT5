EVNT5 Web App

A web application that lets a users to browse events, sign up for them, pay for paid events and add them directly to their Google Calendar. Users can also share events via copying the event url. Also users can also play the role of staff members where they can create new events, view a list of events they've created and also can update/delete events and they will be removed from both staff dashbaord and from the events page. Also users will recieve a confrimation email upon signup

---

🌐 Live Demo: (https://evnt5-97cf1.firebaseapp.com/)

---

Notes

Only users who log in via the google login in butoon can add events to a Google Calendar due to authentication requirements, users who log in via email/password will only be able to sign up to events and pay if required

To log into the app via staff, You'll need an email address that ends with @evnt5.com to register as a staff member.

Upon signing up to a paid event you'll be navigated to a payment page. Because no real money is being exchanged and because Stripe is in test mode, youll have to use these numbers

Card Number- 4242 4242 4242 4242

cvc- any date can be used aslong as it is a date that is pass the event date you have signed up for.

then the 3 digit number you can pass in is 123 and for the zip code you can pass in 12345.

---

🚀 Tech Stack

React (with Vite) for fast, modular UI

React Router for client-side routing

Firebase- Authentication, Firestore, Hosting and Cloud Functions

Google Calendar API- Add events to calendars

EmailJs- Confirmation emails sent out to users

Stripe- Payment process for paid events

CSS

---

🔍 Features

Browse events and view event details

Sign up for free and paid events

Google calendar integration which adds events automatically to user's calendar

Shareable URL event links

Payment intergration

Imitate Staff member to manage events

Notifications throughout the app

---

📁 Project Structure

evnt5/
├─ src/
│  ├─ components/    # React components (EventCard, UserNavbar, Footer)
│  ├─ css/           # Stylesheets
│  ├─ firebase/      # Firebase config & Firestore helpers
│  ├─ utils/         # Utility functions (e.g., convertDateAndTime)
│  └─ pages/         # Page components (UserEventDetailsPage, StaffEventPage)
├─ functions/        # Firebase Cloud Functions (Google Calendar, Stripe, etc.)
├─ dist/             # Build output for Firebase hosting
├─ public/           # Public static files
├─ firebase.json     # Firebase configuration
├─ package.json      # Project metadata & dependencies
└─ README.md         # Project documentation


---

⚙️ Getting Started (Local Development)
1. git clone this repository and then create a repository called evnt5 then direct yourself into that folder and then run git clone https://github.com/GeorgeA25/EVNT5.git 

2. npm install, then navigate into the functions folder via the terminal by doing cd functions. then npm install again. Ensure all these packages are installed if not already npm install firebase-admin firebase-functions stripe googleapis cors.

3. Set firebase secrets for Google and Stripe by running these commands. 
firebase functions:secrets:set GOOGLE_CLIENTS_ID
firebase functions:secrets:set GOOGLE_CLIENTS_SECRETS
firebase functions:secrets:set STRIPE_SECRET_KEY

4. navigate back to events folder by doing cd ... Then create an .env file and store these inside that folder
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

Also note that you should store the .env file inside the .gitignore file for privacy

5. Then run npm run dev and click on your local host URL

---

📝 Prerequisites / Required Accounts

Before running the app locally, you'll need to setup accounts and credentials for the following services:

1.Firebase

First signup to firebase and create a project. Upon creating a project inside the settings of project overview, if you scroll down you'll see your firebase config object which you'll need to store inside the .env file. Also you'll need to set up Firestore, Authentication and functions. Also on the authentication page you'll have to enable email/passsword and google login as well.

2.Google API(Google Calendar

First sign up to google cloud console and create a project via this link (https://console.cloud.google.com/). Then on search in search bar for library and select Google Calendar API. You'll need to enable this in order to use. You'll also need to create an OAuth2.0client id where you'll receive some more tokens like id's and a secret key that can be stored in the .env file. Then you'll need to authorize your origins and redirects with your localhost url and save. Bare in mind any URLS that have a hosted website you'll need to change those url to your local host url then firebase deploy --only functions to use them 

3.Stripe

Firstly you'll need to sign up to a Stripe account. Inside there you'll be able to retrieve your secret key which can then be installed into .env file

4.EmailJS

Sign up for an account with EmailJS then create a service and a template where upon creation you'll recieve keys that can be stored inside. Also make sure to grab the public key as well and store all of these inside your .env file 

---

🔧 Requirements

Node.js v20 inside package.json file inside functions folder

📝 Credits EVNT5 created by @GeorgeA25. If you run into any issues or need more details about setting up locally please get in touch.
