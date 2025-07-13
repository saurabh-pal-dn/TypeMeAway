import { hyperNovaRepo } from "./hypernova";
import { nuShellRepo } from "./nushell";
import { sunPyRepo } from "./sunpy";
import { vsCodeRepo } from "./vscode";

export type RepoFile = {
  path: string;
  code: string;
};

export type Repo = {
  label: string;
  url: string;
  files: RepoFile[];
};

export type EditorResult = {
  totalChars: number;
  correctChars: number;
  totalTime: number;
  endReached: boolean;
};

export const repos: Repo[] = [
  sunPyRepo,
  hyperNovaRepo,
  vsCodeRepo,
  nuShellRepo,
];
