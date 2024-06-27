# Digital Restaurant Menu

This is a digital restaurant menu application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- MongoDB Atlas account or a local MongoDB instance

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/soni-prakhar07/DigitalMenu.git
   cd DigitalMenu

2. Install Dependencies

    ```bash
    npm install

3. create a .env file based on the ".env.example" file

4. Update the .env file with your MongoDB URI and desired port:

    PORT=5000
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority

<h2>Running the application</h2>

1. Start the server with the following command:
        nodemon src/index.js

2. the application will be available at "https://localhost:5000"