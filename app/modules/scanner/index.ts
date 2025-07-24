import { Lox } from "../lox";
import { Token } from "../tokens";
import { TokenType } from "../tokens/types";
import { RESERVED_IDENTIFIERS } from "./constants";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  readonly lox = new Lox();

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      new Token({
        type: TokenType.EOF,
        lexeme: "",
        literal: null,
        line: this.line,
      })
    );

    return this.tokens;
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token({ type, lexeme: text, literal, line: this.line })
    );
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const char = this.advance();
    switch (char) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          // ignore comment
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case '"':
        this.string();
        break;
      case " ":
      case "\t":
      case "\r":
        break;
      case "\n":
        this.line++;
        break;
      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          this.lox.error(this.line, `Unexpected character: ${char}`);
        }
        break;
    }
  }

  private advance(): string {
    // se utiliza el valor de current para obtener el char
    // posteriormente se suma 1
    return this.source.charAt(this.current++);
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";

    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    const nextCurrent = this.current + 1;
    if (nextCurrent >= this.source.length) return "\0";

    return this.source.charAt(nextCurrent);
  }

  private number(): void {
    // Continue until end of source or non-digit character
    while (this.isDigit(this.peek())) this.advance();

    let hasDecimals = false;
    let decimalValue = 0;
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // consume the "."
      this.advance();
      const firstDecimalIndex = this.current;
      hasDecimals = true;
      while (this.isDigit(this.peek())) this.advance();

      decimalValue = parseInt(
        this.source.substring(firstDecimalIndex, this.current - 1)
      );
    }

    this.addToken(
      TokenType.NUMBER,
      hasDecimals && decimalValue > 0
        ? parseFloat(this.source.substring(this.start, this.current))
        : parseFloat(this.source.substring(this.start, this.current)).toFixed(1)
    );
  }

  private string(): void {
    while (!this.isAtEnd()) {
      const char = this.advance();

      if (char === "\n") {
        this.lox.error(this.line, "Unterminated string");
        this.line++;
        break;
      }

      if (char === '"') {
        const literal = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, literal);
        break;
      }
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    // check if identifier is reserved
    const text = this.source.substring(this.start, this.current);
    const tokenType = RESERVED_IDENTIFIERS.get(text);

    this.addToken(tokenType || TokenType.IDENTIFIER);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  // :::
  // HELPERS
  // :::

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char == "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isDigit(value: string) {
    return value >= "0" && value <= "9";
  }
}
