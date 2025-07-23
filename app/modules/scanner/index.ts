import { Lox } from "../lox";
import { Token } from "../tokens";
import { TokenType } from "../tokens/types";

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

  private addToken(type: TokenType, literal: string | null = null): void {
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
        this.match("/") ? this.ignoreComment() : this.addToken(TokenType.SLASH);
        break;
      case '"':
        while (!this.isAtEnd()) {
          const char = this.advance();
          if (char === "\n") {
            this.lox.error(this.line, "Unterminated string");
            break;
          }

          if (char === '"') {
            const literal = this.source.substring(
              this.start + 1,
              this.current - 1
            );
            this.addToken(TokenType.STRING, literal);
            break;
          }
        }
        break;
      case " ":
      case "\t":
      case "\r":
        break;
      case "\n":
        this.line++;
        break;
      default:
        this.lox.error(this.line, `Unexpected character: ${char}`);
        break;
    }
  }

  private advance(): string {
    // se utiliza el valor de current para obtener el char
    // posteriormente se suma 1
    return this.source.charAt(this.current++);
  }

  private ignoreComment(): void {
    while (!this.isAtEnd()) {
      const char = this.advance();
      if (char === "\n") return;
    }
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }
}
