export const ANSI_COLORS = {
  BLACK: 30,
  RED: 31,
  GREEN: 32,
  YELLOW: 33,
  BLUE: 34,
  MAGENTA: 35,
  CYAN: 36,
  WHITE: 37,
  BLACK_BACKGROUND: 40,
  RED_BACKGROUND: 41,
  GREEN_BACKGROUND: 42,
  YELLOW_BACKGROUND: 43,
  BLUE_BACKGROUND: 44,
  MAGENTA_BACKGROUND: 45,
  CYAN_BACKGROUND: 46,
  WHITE_BACKGROUND: 47,
  BRIGHT_BLACK: 90,
  BRIGHT_RED: 91,
  BRIGHT_GREEN: 92,
  BRIGHT_YELLOW: 93,
  BRIGHT_BLUE: 94,
  BRIGHT_MAGENTA: 95,
  BRIGHT_CYAN: 96,
  BRIGHT_WHITE: 97,
  BRIGHT_BLACK_BACKGROUND: 100,
  BRIGHT_RED_BACKGROUND: 101,
  BRIGHT_GREEN_BACKGROUND: 102,
  BRIGHT_YELLOW_BACKGROUND: 103,
  BRIGHT_BLUE_BACKGROUND: 104,
  BRIGHT_MAGENTA_BACKGROUND: 105,
  BRIGHT_CYAN_BACKGROUND: 106,
  BRIGHT_WHITE_BACKGROUND: 107,
} as const;

export class Logger {
  static ansiString(color: number) {
    return `\x1b[${color}m%s\x1b[0m`;
  }

  static error(message: string) {
    console.error(this.ansiString(ANSI_COLORS.RED), message);
  }

  static warn(message: string) {
    console.warn(this.ansiString(ANSI_COLORS.YELLOW), message);
  }

  static info(
    message: string,
    color: (typeof ANSI_COLORS)[keyof typeof ANSI_COLORS] = ANSI_COLORS.BLACK,
  ) {
    console.log(this.ansiString(color), message);
  }
}
