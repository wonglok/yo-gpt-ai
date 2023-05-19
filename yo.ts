// @ts-nocheck

import { GPT4All } from "gpt4all";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";
import { exec, spawn } from "child_process";
import * as fs from "fs";

const main = async () => {
  // Instantiate GPT4All with default or custom settings
  const gpt4all = new GPT4All("gpt4all-lora-quantized", false); // Default is 'gpt4all-lora-quantized' model

  const platform = os.platform();

  if (platform === "darwin") {
    const { stdout } = await promisify(exec)("uname -m");
    if (stdout.trim() === "arm64") {
      // @ts-ignore
      gpt4all.executablePath = path.join(
        __dirname,
        "./gpt4all/gpt4all-lora-quantized-OSX-m1"
      );
    } else {
      // @ts-ignore
      gpt4all.executablePath = path.join(
        __dirname,
        "./gpt4all/gpt4all-lora-quantized-OSX-intel"
      );
    }
  } else if (platform === "linux") {
    // @ts-ignore
    gpt4all.executablePath = path.join(
      __dirname,
      "./gpt4all/gpt4all-lora-quantized-linux-x86"
    );
  } else if (platform === "win32") {
    // @ts-ignore
    gpt4all.executablePath = path.join(
      __dirname,
      "./gpt4all/gpt4all-lora-quantized-win64.exe"
    );
  }

  let modelPath = path.join(__dirname, "./model/gpt4all-lora-quantized.bin");
  if (!fs.existsSync(modelPath)) {
    await gpt4all.downloadFile(
      `https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin`,
      modelPath
    );
  }

  // @ts-ignore
  await fs.chmod(gpt4all.executablePath, 0o755, (err) => {
    if (err) {
      throw err;
    }
  });

  // @ts-ignore
  gpt4all.modelPath = modelPath;

  // Initialize and download missing files
  await gpt4all.init();

  console.log("123");

  try {
    // Open the connection with the model
    await gpt4all.open();
  } catch (e) {
    console.log(e);
  }

  console.log("open");

  let all = "";
  // @ts-ignore
  gpt4all.bot.stdout.on("data", (buffer) => {
    let string = buffer.toString();

    all += string;
    console.log(all);
  });

  // Generate a response using a prompt
  const prompt =
    "Tell me about how Open Access to AI is going to help humanity.";
  const response = await gpt4all.prompt(prompt);
  console.log(`Prompt: ${prompt}`);
  console.log(`Response: ${response}`);

  console.log("done 1");

  const prompt2 =
    "Explain to a five year old why AI is nothing to be afraid of.";
  const response2 = await gpt4all.prompt(prompt2);
  console.log(`Prompt: ${prompt2}`);
  console.log(`Response: ${response2}`);
  console.log("done 2");

  // Close the connection when you're done
  gpt4all.close();

  // say hello world
};

const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;
const { Server } = require("socket.io");
const io = new Server(server);

// app.get("/ask", () => {
//   main().catch(console.error);
// });

app.get(["/", "/:name"], (req, res) => {
  let greeting = "<h1>Hello From Node on Fly!</h1>";
  let name = req.params["name"];
  if (name) {
    res.send(greeting + "</br>and hello to " + name);
  } else {
    res.send(greeting);
  }
});

main().catch((r) => console.log(r));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("start", () => {
    //
  });
});

server.listen(port, () =>
  console.log(`HelloNode app listening on port ${port}!`)
);
