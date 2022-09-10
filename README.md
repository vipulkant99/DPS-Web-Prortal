# 🤝 PeerTECH Web

[PeerTECH](https://collabrh.com/peertech) is a peer and technology-supported self-management intervention that teaches adults with a lived experience of a mental health condition on how to co-manage psychiatric illness and chronic health conditions. 

This web app serves as the admin portal for the PeerTECH platform. It enables super-admins and admins to access information about participating organizations' service users, peers, and chats while modifying surveys and resources libraries. It also allows new peer/user accounts to be created and admins to be assigned.

DALI is partnering with Dartmouth psychiatry professor Karen Fortuna, creator of the [Digital Peer Support](https://collabrh.com) project under which PeerTECH falls, to rebuild and expand on previous versions of the PeerTECH mobile app and admin portal.

## Designs

[Link to the project Figma](https://www.figma.com/file/DMsYdgZu01hOmN1N11csxL/PeerTECH-20S)

[2-4 screenshots from the app]

## Architecture
### Tech Stack 🥞

The entire app is built in React, with add-ons like webpack, Babel, and Sass

Global state is managed with [React-Redux](https://react-redux.js.org/) and routing is handled by [React-Router](https://www.npmjs.com/package/react-router-dom).

We are using Google's [Cloud Firestore](https://firebase.google.com/docs/firestore) for storage and Google's [Identity Platform](https://cloud.google.com/identity-platform) for authentication.

[Mobile repo](https://github.com/dali-lab/peertech)

[Backend repo](https://github.com/dali-lab/peertech-backend)

#### Packages 📦

* [redux-persist](https://www.npmjs.com/package/redux-persist) to persist/rehydrate the Redux store on refresh
* [draft-js-plugins-editor](https://www.npmjs.com/package/draft-js-plugins-editor) for a rich text editor that converts to Markdown
* [react-loading-overlay](https://www.npmjs.com/package/react-loading-overlay) for loading states
* [react-toastify](https://www.npmjs.com/package/react-toastify) for error/success alerts

### Redux Structure

#### `auth`

| Property | Description |
| --- | --- |
| `name` | User's name |
| `email` | User's email |
| `uid` | User's unique identifier under Google Identity Platform |
| `role` | User's PeerTECH role (Service-User, Peer, Admin, or Super-Admin) |
| `orgID` | Organization ID that user is associated with (may be blank for Super-Admins) |

#### `users`

| Property | Description |
| --- | --- |
| `orgUsers` | Array of objects representing organization's users |

#### `loading`

| Property | Description |
| --- | --- |
| `isLoading` | Whether the site should display a loading overlay |

#### `alert`

| Property | Description |
| --- | --- |
| `errorMessage` | Error message to be displayed on toast alert |
| `successMessage` | Success message to be displayed on toast alert |

#### `orgs`

| Property | Description |
| --- | --- |
| `organizations` | Array of objects representing all PeerTECH organizations (their IDs and names) |
| `selectedOrgID` | Current organization ID to show data for. Super-Admins can change this. |
| `selectedOrgName` | Organization name corresponding to `selectedOrgID` |

### Style

We are using the ESLint Airbnb style guide for this project. See the style guide (rules) linked [here](https://github.com/airbnb/javascript).

### File Structure

```
├──src/                 # root directory
|  └──index.js          # configures/loads root App component
|  └──index.html        # Base HTML file; loads fonts and creates main div
|  └──style.scss        # CSS styling
|  └──firebase.js       # Database calls and configuration
|  └──components/       # React components with logic to fetch data and display views
|     └──App.js         # root React component, creates router and renders all other components within itself
|  └──helpers/          # enums and higher-order components
|  └──redux/            # creates redux actions and reducers
```

For more detailed documentation on our file structure and specific functions in the code, feel free to check the project files themselves.

## Setup Steps 

1. Clone repo by running `git clone https://github.com/dali-lab/peertech-web` in your terminal
2. Install yarn, the package manager, if you don't already have it. [Instructions here](https://classic.yarnpkg.com/en/docs/install/).
3. Run `yarn install` to set up all packages
4. Run `yarn start` to start the app at port http://localhost:8080/

Please check out [the wiki](https://github.com/dali-lab/peertech-web/wiki) before getting started for things to note about the app's structure and functionality. We will do our best to keep it up to date!

## Branches, Development and Deployment

We have been developing new features on the `development` branch, and pushing to the `master` branch to create a new release. The app on the `development` branch uses a separate Google Firestore account and database from our production database. 

We're using local environment variables to connect to our dev/prod databases. If you need any of the configuration variables for firebase, they are available on the firebase developer console, as well as accessible through the netlify settings for the sites. 

The development website is live on Netlify at https://peertech-dev.netlify.app/

The production website is live on Netlify at https://peertech.netlify.app/.

Our repo is setup for automatic deployment with netlify. Pushing to the `develop` branch will deploy to our dev site and pushing to the `master` branch will deploy to the production site. 

## Contributors

### Developers

* Shreyas Agnihotri '21
* Anne Bailey '22
* Sanjana Goli '22
* Annika Kouhia '20
* Jeff Liu '23
* Rohan Robinson '21
* Donia Tung '22

### Designers

* Urie Choi '21
* Bridget Ma '21
* Cindy Yuan '22
* Sarah Falkson '22
* Bella Jacoby '20
* Eric Wang '20

### Project Managers

* Annika Kouhia '20
* Donia Tung '22

## Acknowledgments 🤝

We would like to thank our partners, Karen and Amanda, for their support and flexibility with this project. 

---
Designed and developed by [@DALI Lab](https://github.com/dali-lab)
