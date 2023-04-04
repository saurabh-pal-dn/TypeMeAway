import { backspaceKey, enterKey, tabKey } from "./keyboard";
import { separatorLine } from "./terminal";
const editorElement = document.getElementById("editor") as HTMLElement;
const statsElement = document.getElementById("stats") as HTMLElement;

const LINES_PER_PAGE = 6;
const TYPING_TIME_IN_MILLISECONDS = 45000;
const CURSOR_CLASS_NAME = "cursor";
const NEXT_CLASS_NAME = "next";
const _WRONG_CLASS_NAME = "wrong";
const WHITE_SPACE_REGEX: RegExp = /\s/;

export type EditorResult = {
  totalChars: number;
  correctChars: number;
  totalTime: number;
  endReached: boolean;
};

function clearEditorElement() {
  editorElement.innerHTML = "";
}
function clearStatsElement() {
  statsElement.innerHTML = "";
}

function printCode(lines: string[]): Element {
  clearEditorElement();
  let index = 0;
  lines.forEach((line: string) => {
    for (const character of line) {
      const span = document.createElement("span");
      span.innerText = character;
      if (index > 0) span.classList.add(NEXT_CLASS_NAME);
      if (WHITE_SPACE_REGEX.test(character))
        span.setAttribute("data-whitespace", "true");
      editorElement.appendChild(span);
      index++;
    }
    editorElement.append(document.createElement("br"));
  });
  const firstElement = editorElement.firstChild as Element;
  firstElement.classList.add(CURSOR_CLASS_NAME);
  return firstElement;
}

function printStats(result: EditorResult): void {
  const secondsLeft = (
    (TYPING_TIME_IN_MILLISECONDS - result.totalTime) /
    1000
  ).toFixed(0);
  statsElement.innerHTML = [
    "",
    separatorLine,
    `Time left: ${secondsLeft} seconds`,
    `Characters typed: ${result.totalChars}`,
    `Errors: ${result.totalChars - result.correctChars}`,
  ].join("<br/>");
}

function normalizeCode(code: string): string {
  return code.trim().replace(/\t/g, " ");
}

export function startEditor(code: string): Promise<EditorResult> {
  const normalizedCode: string = normalizeCode(code);
  return new Promise<EditorResult>(async (resolve) => {
    const allLines: string[] = code
      .split(/[ \t]*\r?\n/)
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => line + " ");

    let firstLineIndex = 0;
    let charIndex = 0;
    let lineIndex = 0;
    let totalCharacters = 0;
    let correctCharacters = 0;
    let pageLines: string[] = allLines.slice(firstLineIndex, LINES_PER_PAGE);
    let line: string = pageLines[lineIndex];
    let element: Element = printCode(pageLines);
    let startTime = 0;
    let timeoutHandle = 0;
    let statsIntervalHandle = 0;
    let lineCorrectness: boolean[] = [];

    const advanceCharacter = (isCorrect: boolean) => {
      element.classList.remove(CURSOR_CLASS_NAME);
      if (!isCorrect) element.classList.add(_WRONG_CLASS_NAME);
      element = element.nextElementSibling as Element;
      element.classList.remove(NEXT_CLASS_NAME);
      element.classList.add(CURSOR_CLASS_NAME);
      lineCorrectness.push(isCorrect);
      charIndex++;
    };

    const doBackspace = () => {
      element.classList.remove(CURSOR_CLASS_NAME);
      element.classList.add(NEXT_CLASS_NAME);
      element = element.previousElementSibling as Element;
      element.classList.remove(_WRONG_CLASS_NAME);
      element.classList.add(CURSOR_CLASS_NAME);
      charIndex--;
      if (lineCorrectness[charIndex]) correctCharacters--;
      lineCorrectness = lineCorrectness.slice(0, -1);
    };

    const advanceWhitespace = () => {
      let count = 0;
      while (
        charIndex + count < line.length - 1 &&
        WHITE_SPACE_REGEX.test(line[charIndex + count])
      ) {
        advanceCharacter(true);
      }
    };

    const advanceLine = () => {
      line = pageLines[++lineIndex];
      charIndex = 0;
      lineCorrectness = [];
      element.classList.remove(CURSOR_CLASS_NAME);
      element = element.nextElementSibling?.nextElementSibling as Element;
      element.classList.remove(NEXT_CLASS_NAME);
      element.classList.add(CURSOR_CLASS_NAME);
      advanceWhitespace();
    };

    const advancePage = () => {
      firstLineIndex += pageLines.length;
      pageLines = allLines.slice(
        firstLineIndex,
        firstLineIndex + LINES_PER_PAGE
      );
      lineIndex = 0;
      charIndex = 0;
      line = pageLines[lineIndex];
      element = printCode(pageLines);
      advanceWhitespace();
    };

    const getResult = (): EditorResult => {
      const now = new Date().valueOf();
      const totalTime = now - startTime;
      return {
        correctChars: correctCharacters,
        totalChars: totalCharacters,
        totalTime,
        endReached: totalTime <= TYPING_TIME_IN_MILLISECONDS,
      };
    };

    const endTyping = () => {
      document.removeEventListener("keydown", listener);
      clearTimeout(timeoutHandle);
      clearInterval(statsIntervalHandle);
      resolve(getResult());
    };

    const beginTyping = () => {
      startTime = new Date().valueOf();
      timeoutHandle = setTimeout(endTyping, TYPING_TIME_IN_MILLISECONDS);
      statsIntervalHandle = setInterval(() => printStats(getResult()), 1000);
    };

    const processKey = (key: string) => {
      if (key.length === 1 && charIndex < line.length - 1) {
        if (startTime <= 0) beginTyping();
        const isCorrect = key === line[charIndex]; //chekcing for char
        advanceCharacter(isCorrect);
        if (isCorrect) correctCharacters++;
        totalCharacters++;

        //if we are at the bottom of the page
        if (
          charIndex === line.length - 1 &&
          lineIndex === pageLines.length - 1
        ) {
          if (firstLineIndex < allLines.length - 1) advancePage();
          else endTyping();
        }
      } else if (charIndex > 0 && key === backspaceKey) {
        doBackspace();
      } else if (charIndex === line.length - 1 && key === enterKey) {
        totalCharacters++;
        correctCharacters++;
        if (lineIndex < pageLines.length - 1) advanceLine();
      } else {
        return;
      }

      printStats(getResult());
    };

    const listener = (event: KeyboardEvent) => {
      const key = event.key;
      if (key === tabKey) {
        processKey(" ");
        processKey(" ");
        event.preventDefault();
        event.stopPropagation();
      } else {
        processKey(key);
      }
    };
    document.addEventListener("keydown", listener);
  });
}

export function clearEditor(): void {
  clearEditorElement();
  clearStatsElement();
}
