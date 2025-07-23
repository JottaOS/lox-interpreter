import { SysExit } from "./types";

export class Lox {
  private hadError: boolean = false;

  run() {
    if (this.hadError) {
      process.exit(SysExit.EX_DATAERR);
    }
  }

  error(line: number, message: string) {
    this.hadError = true;
    console.log(`[line ${line}] Error: ${message}`);
  }
}
