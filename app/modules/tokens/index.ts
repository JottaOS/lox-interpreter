import type { IToken, TokenType } from "./types";

export class Token {
  private type: TokenType;
  private lexeme: string;
  private literal: any;
  private line: number;

  constructor(params: IToken) {
    this.type = params.type;
    this.lexeme = params.lexeme;
    this.literal = params.literal;
    this.line = params.line;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
