import {
  TYPING_DELAY_IN_MILLISECONDS,
  INPUT_REGEX,
  PROMPT_PREFIX,
} from "./constants/terminal-constants";
import { enterKey, backspaceKey } from "./constants/keyboard-constants";
import { getRandomIndex } from "./utility";

const terminalElement = document.getElementById("terminal") as HTMLElement;
const cursorElement = document.getElementById("cursor") as HTMLElement;

export function addTerminalCursor(): void {
  if (cursorElement.parentElement !== terminalElement)
    terminalElement.appendChild(cursorElement);
}

export function removeTerminalCursor(): void {
  if (cursorElement.parentElement === terminalElement)
    terminalElement.removeChild(cursorElement);
}

function writeChar(char: string): void {
  const span = document.createElement("span");
  span.textContent = char;
  terminalElement.appendChild(span);
  terminalElement.append(cursorElement);
  terminalElement.scrollTop = terminalElement.scrollHeight;
}

function removeLastChar(): void {
  terminalElement.removeChild(cursorElement);
  const last = terminalElement.lastChild;
  if (last) terminalElement.removeChild(last);
  terminalElement.append(cursorElement);
}

export function writeLineBreak(): void {
  terminalElement.appendChild(document.createElement("br"));
}

export function writeSingleLine(line: string): Promise<void> {
  return new Promise<void>((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      writeChar(line[index++]);
      if (index >= line.length) {
        clearInterval(interval);
        resolve();
      }
    }, TYPING_DELAY_IN_MILLISECONDS);
  });
}

export async function writeLines(lines: string[]): Promise<void> {
  removeTerminalCursor();
  for (const line of lines) {
    await writeSingleLine(line);
    writeLineBreak();
  }
}

export function readLine(): Promise<string> {
  return new Promise<string>((resolve) => {
    let line = "";
    const listener = (event: KeyboardEvent) => {
      const key = event.key;
      if (INPUT_REGEX.test(key)) {
        line += key;
        writeChar(key);
      } else if (key === enterKey && line.length > 0) {
        document.removeEventListener("keydown", listener);
        writeLineBreak();
        resolve(line);
      } else if (key === backspaceKey && line.length > 0) {
        event.preventDefault();
        line = line.slice(0, line.length - 1);
        removeLastChar();
      }
    };

    writeSingleLine(PROMPT_PREFIX);
    document.addEventListener("keydown", listener);
  });
}

export function clearTerminal() {
  terminalElement.innerHTML = "";
}

type Option = {
  label: string;
};

const CHOICE_OPTION_ERROR_MESSAGES: string[][] = [
  ["Please type a", "मूर्ख मत बनो :)"],
  ["A", "Or do I have to come out of the computer to do this for you?"],
  ["Ok, you've had your fun... Simply enter a", "This is important!"],
  ["What does that even mean? Please, a", "I thought you were a big boy :-<"],
  [
    "Ok, wow... Do me a favor here with a",
    "It's getting embarrassing now, really.",
  ],
  ["Let me check... Nope, that's not a", "Let's get serious for once, hm?"],
];

export async function chooseOption<T extends Option>(options: T[]) {
  await writeLines([
    ...options.map((option, index) => `${index + 1}. ${option.label}`),
  ]);
  let index = -1;
  while (index === -1) {
    const numberRead = await readLine();
    const numberReceived = parseInt(numberRead);
    if (numberReceived > 0 && numberReceived <= options.length) {
      index = numberReceived - 1;
    } else {
      const errMessageIndex = getRandomIndex(
        CHOICE_OPTION_ERROR_MESSAGES.length
      );

      const errMessage = CHOICE_OPTION_ERROR_MESSAGES[errMessageIndex];
      await writeLines([
        " ",
        `${errMessage[0]} number from 1 to ${options.length}`,
        errMessage[1],
        " ",
      ]);
    }
  }
  return options[index];
}
