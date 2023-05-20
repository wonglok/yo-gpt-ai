// @ts-nocheck

import { GPT4All } from "gpt4all";
import * as path from "path";
import * as os from "os";
import { promisify } from "util";
import { exec, spawn } from "child_process";
import * as fs from "fs";
import axios from "axios";
import ProgressBar from "progress";

const main = async (myPrompt = "how are you", res) => {
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

  let hasFile = false;
  try {
    hasFile = fs.existsSync(modelPath);
  } catch (e) {
    console.log(e);
  }
  if (!hasFile) {
    let download = async (url) => {
      const { data, headers } = await axios.get(url, {
        responseType: "stream",
      });
      const totalSize = parseInt(headers["content-length"], 10);
      const progressBar = new ProgressBar("[:bar] :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 20,
        total: totalSize,
      });

      const dir = new URL(`file://${path.join(__dirname, "./model")}`);
      await fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
      });

      const writer = fs.createWriteStream(modelPath);

      let currentAccu = 0;
      data.on("data", (chunk: any) => {
        progressBar.tick(chunk.length);
        currentAccu += chunk.length;
        console.log(
          "donwnloading..." + ((currentAccu / totalSize) * 100).toFixed(2) + "%"
        );
      });

      data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    };

    // await gpt4all.downloadFile(
    //   `https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin`,
    //   modelPath
    // );

    await download(
      `https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin`
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

  console.log("starting");

  try {
    // Open the connection with the model
    await gpt4all.open();
  } catch (e) {
    console.log(e);
  }

  console.log("opened the app");

  return gpt4all;

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

let gpt4allProm = main().catch(console.error);

app.use(express.static("public"));

// main().catch((r) => console.log(r));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("prompt", async (data) => {
    //

    let prompt = data.prompt;
    let gpt4all = await gpt4allProm;

    //
    let all = "";
    // @ts-ignore
    let onReceive = (buffer) => {
      let string = buffer.toString();
      let arr = all.split("\n");
      if (arr.indexOf(">") === arr.length - 1) {
      } else {
        all = `${all}${string}`;
      }

      socket.emit("message", {
        id: data.id,
        msg: all
          .replace(`\u001b[1m\u001b[32m\u001b[0m`, "")
          .replace(`\u001b[0m`, ""),
      });
    };
    gpt4all.bot.stdout.on("data", onReceive);
    await gpt4all.prompt(prompt);
    gpt4all.bot.stdout.off("data", onReceive);

    //
  });
});

server.listen(port, () =>
  console.log(`HelloNode app listening on port ${port}!`)
);
