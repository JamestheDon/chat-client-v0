# Chat Client v0

This is a React-based chat client application that communicates with a backend server for authentication and messaging.

## Prerequisites

- **Node.js** (version 14.x or newer)
- **npm** (version 6.x or newer)

Ensure that the backend server is running on `http://localhost:8000`. The client relies on this server for authentication and messaging.

## Installation

1. **Clone the repository from GitHub or Azure DevOps:**

   - **From GitHub:**

     ```bash
     git clone https://github.com/your-username/chat-client-v0.git
     ```

   - **From Azure DevOps:**

     ```bash
     git clone https://dev.azure.com/your-organization/your-project/_git/chat-client-v0
     ```

   Replace the URLs with your actual repository paths.

2. **Navigate to the project directory:**

   ```bash
   cd chat-client-v0
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload if you make changes.  
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

## Usage

1. **Start the backend server** (ensure it's running at `http://localhost:8000`).

2. **Start the client application:**

   ```bash
   npm start
   ```

3. **Access the app:**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Register or log in:**

   - Click **Register** to create a new account.
   - Use **Login** if you already have an account.

5. **Start chatting:**

   - After logging in, you can send messages using the chat interface.

## Configuration

- The client proxies API requests to `http://localhost:8000`. If your backend is running elsewhere, update the `proxy` field in `package.json`:

  ```json:chat-client-v0/package.json
  "proxy": "http://your-backend-url:port"
  ```

## Learn More

To learn more about React and Create React App, see the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and the [React documentation](https://reactjs.org/).
