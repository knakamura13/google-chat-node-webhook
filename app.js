// Import packages
const fs = require("fs");
const assert = require("assert");
const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const { google } = require("googleapis");
const chat = google.chat("v1");

/********************
 * Global Variables *
 ********************/

// Define spaces for testing purposes
const spaces = {
  dylan: "xTiBLgAAAAE",
  kyle: "iuAuLgAAAAE",
};

/*****************************
 * Google Auth Configuration *
 *****************************/

const keyFileName = "google_credentials.json";
const envCredentials = process.env.GOOGLE_CREDENTIALS; // .env should resemble: GOOGLE_CREDENTIALS={"project_id":"1234", ...}

// Create a json file from the .env `GOOGLE_CREDENTIALS` property
if (fs.existsSync(keyFileName) === false) {
  try {
    const credentials = JSON.parse(envCredentials);
    const clientID = credentials.client_id;
    assert(clientID && typeof Number(clientID) === "number");

    console.log("Loaded credentials from environment variable");
  } catch (err) {
    err =
      "Environment var GOOGLE_CREDENTIALS must be a JSON.stringified object";
    throw Error(err);
  }

  fs.writeFile(keyFileName, envCredentials, (err) => {});
}

// Obtain an auth client for the chat.bot scope using the existing service account
const authClient = new google.auth.GoogleAuth({
  keyFile: keyFileName,
  scopes: "https://www.googleapis.com/auth/chat.bot",
});

// Add the new auth client to the googleapis object
google.options({
  auth: authClient,
});

/***************
 * Node Routes *
 ***************/

const port = 80;
app.listen(80, () => console.log(`Listening on port ${port}...\n`));

app.get("/", (req, res, next) => {
  const params = JSON.stringify(req.query);
  const msg = `Got your GET request with these params: ${params}`;

  postMessage(msg, spaces.kyle).then(() => {
    res.json({
      status: 400,
      message: msg,
    });
  });
});

app.post("/", (req, res) => {
  const params = JSON.stringify(req.query);
  const msg = `Got your POST request with these params: ${params}`;

  postMessage(msg, spaces.kyle).then(() => {
    res.json({
      status: 400,
      message: msg,
    });
  });
});

/*************
 * Functions *
 *************/

// Asynchronously send a message to a specific Google Chat space
async function postMessage(msg, space) {
  return chat.spaces.messages
    .create({
      parent: `spaces/${space}`,
      requestBody: newText(msg),
    })
    .then((res) => {
      console.log(
        res.status === 200 ? `Message posted to ${space}: '${msg}'` : res
      );
      return res;
    })
    .catch((err) => console.error(`Error creating message: ${err}`));
}

// Form a text response object for Google Chat
function newText(msg) {
  if (typeof msg !== "string") msg = JSON.stringify(msg);
  return { text: msg };
}
