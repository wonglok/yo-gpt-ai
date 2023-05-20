"use strict";
// @ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gpt4all_1 = require("gpt4all");
var path = require("path");
var os = require("os");
var util_1 = require("util");
var child_process_1 = require("child_process");
var fs = require("fs");
var main = function (myPrompt, res) {
    if (myPrompt === void 0) { myPrompt = "how are you"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var gpt4all, platform, stdout, modelPath, hasFile, download, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gpt4all = new gpt4all_1.GPT4All("gpt4all-lora-quantized", false);
                    platform = os.platform();
                    if (!(platform === "darwin")) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, util_1.promisify)(child_process_1.exec)("uname -m")];
                case 1:
                    stdout = (_a.sent()).stdout;
                    if (stdout.trim() === "arm64") {
                        // @ts-ignore
                        gpt4all.executablePath = path.join(__dirname, "./gpt4all/gpt4all-lora-quantized-OSX-m1");
                    }
                    else {
                        // @ts-ignore
                        gpt4all.executablePath = path.join(__dirname, "./gpt4all/gpt4all-lora-quantized-OSX-intel");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    if (platform === "linux") {
                        // @ts-ignore
                        gpt4all.executablePath = path.join(__dirname, "./gpt4all/gpt4all-lora-quantized-linux-x86");
                    }
                    else if (platform === "win32") {
                        // @ts-ignore
                        gpt4all.executablePath = path.join(__dirname, "./gpt4all/gpt4all-lora-quantized-win64.exe");
                    }
                    _a.label = 3;
                case 3:
                    modelPath = path.join(__dirname, "./model/gpt4all-lora-quantized.bin");
                    hasFile = false;
                    try {
                        hasFile = fs.existsSync(modelPath);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    if (!!hasFile) return [3 /*break*/, 5];
                    download = function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, data, headers, totalSize, progressBar, dir, writer;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, axios.get(url, {
                                        responseType: "stream",
                                    })];
                                case 1:
                                    _a = _b.sent(), data = _a.data, headers = _a.headers;
                                    totalSize = parseInt(headers["content-length"], 10);
                                    progressBar = new ProgressBar("[:bar] :percent :etas", {
                                        complete: "=",
                                        incomplete: " ",
                                        width: 20,
                                        total: totalSize,
                                    });
                                    dir = new URL("file://".concat(path.join(__dirname, "./model")));
                                    return [4 /*yield*/, fs.mkdir(dir, { recursive: true }, function (err) {
                                            if (err) {
                                                throw err;
                                            }
                                        })];
                                case 2:
                                    _b.sent();
                                    writer = fs.createWriteStream(destination);
                                    data.on("data", function (chunk) {
                                        progressBar.tick(chunk.length);
                                    });
                                    data.pipe(writer);
                                    return [2 /*return*/, new Promise(function (resolve, reject) {
                                            writer.on("finish", resolve);
                                            writer.on("error", reject);
                                        })];
                            }
                        });
                    }); };
                    // await gpt4all.downloadFile(
                    //   `https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin`,
                    //   modelPath
                    // );
                    return [4 /*yield*/, download("https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin")];
                case 4:
                    // await gpt4all.downloadFile(
                    //   `https://agape-appstore.s3.ap-southeast-1.amazonaws.com/model/gpt4all-lora-quantized.bin`,
                    //   modelPath
                    // );
                    _a.sent();
                    _a.label = 5;
                case 5: 
                // @ts-ignore
                return [4 /*yield*/, fs.chmod(gpt4all.executablePath, 493, function (err) {
                        if (err) {
                            throw err;
                        }
                    })];
                case 6:
                    // @ts-ignore
                    _a.sent();
                    // @ts-ignore
                    gpt4all.modelPath = modelPath;
                    // Initialize and download missing files
                    return [4 /*yield*/, gpt4all.init()];
                case 7:
                    // Initialize and download missing files
                    _a.sent();
                    console.log("starting");
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    // Open the connection with the model
                    return [4 /*yield*/, gpt4all.open()];
                case 9:
                    // Open the connection with the model
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 11];
                case 11:
                    console.log("opened the app");
                    return [2 /*return*/, gpt4all];
            }
        });
    });
};
var http = require("http");
var express = require("express");
var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 3000;
var Server = require("socket.io").Server;
var io = new Server(server);
// app.get("/ask", () => {
//   main().catch(console.error);
// });
var gpt4allProm = main().catch(console.error);
gpt4allProm.then(function (gpt4all) {
    var all = "";
    // @ts-ignore
    var onReceive = function (buffer) {
        var string = buffer.toString();
        all += string;
        console.log(all);
    };
    gpt4all.bot.stdout.on("data", onReceive);
});
app.use(express.static("public"));
// main().catch((r) => console.log(r));
io.on("connection", function (socket) {
    console.log("a user connected");
    socket.on("prompt", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var prompt, gpt4all, all, onReceive;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prompt = data.prompt;
                    return [4 /*yield*/, gpt4allProm];
                case 1:
                    gpt4all = _a.sent();
                    all = "";
                    onReceive = function (buffer) {
                        var string = buffer.toString();
                        var arr = all.split("\n");
                        if (arr.indexOf(">") === arr.length - 1) {
                        }
                        else {
                            all = "".concat(all).concat(string);
                        }
                        socket.emit("message", {
                            id: data.id,
                            msg: all
                                .replace("\u001B[1m\u001B[32m\u001B[0m", "")
                                .replace("\u001B[0m", ""),
                        });
                    };
                    gpt4all.bot.stdout.on("data", onReceive);
                    return [4 /*yield*/, gpt4all.prompt(prompt)];
                case 2:
                    _a.sent();
                    gpt4all.bot.stdout.off("data", onReceive);
                    return [2 /*return*/];
            }
        });
    }); });
});
server.listen(port, function () {
    return console.log("HelloNode app listening on port ".concat(port, "!"));
});
