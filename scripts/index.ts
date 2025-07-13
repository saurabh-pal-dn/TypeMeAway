import { SEPARATOR_LINE } from "./constants/terminal-constants";
import { EditorResult, Repo, RepoFile, repos } from "./data/interfaces";
import { startEditor, clearEditor } from "./editor";
import {
  chooseOption,
  clearTerminal,
  readLine,
  removeTerminalCursor,
  writeLines,
} from "./terminal";
import { getRandomIndex } from "./utility";

function getRoundLine(round: number, wantsToPlayAgain: boolean) {
  if (round === 0) return "Welcome adventurer!";
  if (wantsToPlayAgain) return "Let's play again!";
  return "We meet again, let's play!";
}

async function writeFileHeader(repo: Repo, file: RepoFile) {
  clearTerminal();
  const lines = [
    `${repo.label} it is!`,
    SEPARATOR_LINE,
    `Repo: ${repo.url}`,
    `File: ${file.path}`,
    " ",
    "Start typing!",
    SEPARATOR_LINE,
    " ",
  ];
  await writeLines(lines);
}

async function writeResult(result: EditorResult) {
  const errors = result.totalChars - result.correctChars;
  const accuracy =
    result.totalChars <= 0
      ? 0
      : (result.correctChars / result.totalChars) * 100;
  const ccps = accuracy * 60;

  const lines = [
    result.endReached
      ? "Wow you've completed the entire snippet!"
      : "Time's up!",
    "Here are your results:",
    SEPARATOR_LINE,
    " ",
    `Correct characters per minute: ${ccps.toFixed(2)}`,
    `Total errors: ${errors > 0 ? errors : "No errors, what a performance!"}`,
    `Accuracy: ${accuracy.toFixed(2)}%`,
    " ",
    SEPARATOR_LINE,
    "Wanna play again? (y, n)",
    " ",
  ];
  await writeLines(lines);
}

export async function runGame() {
  let round = 0;
  let wantsToPlayAgain = true;

  while (true) {
    clearTerminal();
    const lines: string[] = [
      getRoundLine(round, wantsToPlayAgain),
      "Please select a repo:",
      " ",
    ];
    await writeLines(lines);

    const repo: Repo = await chooseOption(repos);
    const file: RepoFile = repo.files[getRandomIndex(repo.files.length)];
    await writeFileHeader(repo, file);
    removeTerminalCursor();

    const result: EditorResult = await startEditor(file.code);

    clearEditor();
    clearTerminal();
    await writeResult(result);
    const userResponse: string = await readLine();
    wantsToPlayAgain = userResponse.toLowerCase() === "y";
    round++;
  }
}

runGame();
