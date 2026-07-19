# Solobase-SPA
The Solobase-SPA offers a simple and intuitive interface for MySQL database operations, schema management and data imports/exports.

The **Solobase-Server** is a lightweight backend service based on Fastify designed for MySQL data management. Connects via session and utilizes both xDevAPI and mysql2 connections.

## Support This Project
If you find this extension useful, you can support development via PayPal:
[![PayPal](https://img.shields.io/badge/Donate-PayPal-blue)](https://www.paypal.com/donate?hosted_button_id=CRPY96XAY793A)
Thank you for helping keep this project maintained and improving!
written by: Mark Samios [@enigma1](https://github.com/enigma1)

## Features
#### Database Management
- Connect and manage MySQL database sessions
- Browse available databases
- Select active databases for management operations
- Create, modify, and delete databases
- Retrieve database metadata and information
-
#### Database Tables Management
- Browse database tables
- View table definitions and metadata
- Inspect table columns, types, constraints, and indexes
- Create new tables
- Modify existing table structures
- Delete tables

#### Data Management
- Browse table data with row fetching
- Create, update, and delete data rows
- Execute raw SQL queries
- Stream query results
- Abort running SQL operations

#### User Management
- View database users
- Create users
- Edit user configuration
- Delete users

#### Import and Export
- Export complete databases as SQL archives
- Export selected tables with schema and data
- Import SQL data
- Stream large exports using compressed responses

#### Authentication and Sessions
- Session-based authentication
- Secure cookie handling
- Session validation
- Login/logout management
- Automatic session cleanup

#### API Features
- Fastify-based HTTP API
- JSON API responses
- Streaming responses for large operations
- Request validation using schemas
- Structured error handling
- SQL query tracking and diagnostics

#### Typical deployment
Browser -> Optional Local Proxy -> **Solobase-Server**

#### Environment
- Tested on node v20-22
- Tested on npm v10-11

#### Installation
git clone <Solobase-SPA>
cd <Solobase-SPA> folder
npm i

#### Configuration
**Solobase-SPA** is configured through the `index.html` file. You can modify the default values to suit you needs. These option appear under the APP_CONFIG object.

##### User Preferences
Switch for color scheme is called `theme`.

```json
theme: 'clean-slate'
```

Several themes are bundled in the front end

```js
export const themes = [
  'aegean',
  'arctic',
  'black-pearl',
  'clean-slate',
  'deep-blue-sea',
  'frozen-forest',
  'garden',
  'cherry-blossom',
  'lime',
  'medley',
  'mint',
  'neon-lights',
  'pastel',
  'sandstorm',
  'slacken',
  'sunset-vibes',
];
```

Configure the front and back ports used by **Solobase-SPA**.

```json
backPort: 5650
frontPort: 5173
```
Notice there is no domain to specify as the front end needs to match the back-end domain. Only ports can be configured. If you are using this front end on your local machine you may want to install the solobase-proxy for communication with a remote solobase-server.

You can connect in SSL or NON-SSL modes point the browser to the domain of you your choice and make sure the backed uses the same domain.

To create a certificate...
```batch
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout server.key \
  -out server.crt \
  -days 1825
```

Configure the following variables:
```batch
TLS_KEY=/path/to/server.key
TLS_CERT=/path/to/server.crt
```

#### Operation
For *development* use
```
npm run dev
```
otherwise for *production*
```
npm run build
npm run start
```
Output files will be generated under the *dist* folder


##### External Frontend Deployment
If the Solobase frontend SPA is deployed separately from **Solobase-Server** (for example, hosted on another machine or served from a different origin), an additional proxy component can be used to handle the frontend-to-server connection.

The optional proxy component is available here:
https://github.com/enigma1/Solobase-Proxy-Agent

The Solobase Server is located here:
https://github.com/enigma1/Solobase-Server

When the frontend and **Solobase-Server** are deployed together on the same host and origin, the proxy is not required.

## 🧾 License
GNU General Public License (GPL) v3
