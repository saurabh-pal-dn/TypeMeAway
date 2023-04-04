import { hyperNovaRepo } from "./hypernova";
import { sunPyRepo } from "./sunpy";

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

export const repos: Repo[] = [sunPyRepo, hyperNovaRepo];
