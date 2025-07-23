import fs from "fs";
import { Scanner } from "./modules/scanner";

const args: string[] = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: bun tokenize");
  process.exit(1);
}

const command: string = args[0];

if (command !== "tokenize") {
  console.error(`Usage: Unknown command: ${command}`);
  process.exit(1);
}

const filename: string = args[1];
const fileContent: string = fs.readFileSync(filename, "utf8");

const scanner = new Scanner(fileContent);
const tokens = scanner.scanTokens();

tokens.forEach((token) => console.log(token.toString()));

// todo: move Lox class outside scanner
scanner.lox.run();
