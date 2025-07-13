import { Repo, RepoFile } from "./interfaces";

const files: RepoFile[] = [
  {
    path: "src/vs/server/node/serverServices.ts",
    code: `
class ServerLogger extends AbstractLogger {
  private useColors: boolean;

  constructor(logLevel: LogLevel = DEFAULT_LOG_LEVEL) {
    super();
    this.setLevel(logLevel);
    this.useColors = Boolean(process.stdout.isTTY);
  }

  debug(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.Debug)) {
      if (this.useColors) {
        console.log("debug", message, ...args);
      } else {
        console.log([now()], message, ...args);
      }
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.canLog(LogLevel.Info)) {
      if (this.useColors) {
        console.log("info", message, ...args);
      } else {
        console.log([now()], message, ...args);
      }
    }
  }

  flush(): void {}
}`,
  },
  {
    path: "src/vs/server/node/serverServices.ts",
    code: `
constructor(
    logService: ILogService,
    private readonly environmentService: IServerEnvironmentService,
    private readonly configurationService: IConfigurationService
  ) {
    super(new DiskFileSystemProvider(logService), logService);

    this._register(this.provider);
  }

  protected override getUriTransformer(ctx: RemoteAgentConnectionContext): IURITransformer {
    let transformer = this.uriTransformerCache.get(ctx.remoteAuthority);
    if (!transformer) {
      transformer = createURITransformer(ctx.remoteAuthority);
      this.uriTransformerCache.set(ctx.remoteAuthority, transformer);
    }

    return transformer;
}`,
  },
  {
    path: "src/vs/server/node/webClientServer.ts",
    code: `
const getFirstHeader = (headerName: string) => {
  const val = req.headers[headerName];
  return Array.isArray(val) ? val[0] : val;
};

const basePath = getFirstHeader('x-forwarded-prefix') || this._basePath;

const queryConnectionToken = parsedUrl.query[connectionTokenQueryName];
if (typeof queryConnectionToken === 'string') {
  // We got auto have a clean URL, so we strip it
  const responseHeaders: Record<string, string> = Object.create(null);
  responseHeaders['Set-Cookie'] = cookie.serialize(
    connectionTokenCookieName,
    queryConnectionToken,
    {
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    }
  );

  const newQuery = Object.create(null);
  for (const key in parsedUrl.query) {
    if (key !== connectionTokenQueryName) {
      newQuery[key] = parsedUrl.query[key];
    }
  }
  const newLocation = url.format({ pathname: basePath, query: newQuery });
  responseHeaders['Location'] = newLocation;

  res.writeHead(302, responseHeaders);
  return void res.end();
}`,
  },
  {
    path: "src/vs/loader.js",
    code: `
class Environment {
  get isWindows() {
    this._detect();
    return this._isWindows;
  }
  get isNode() {
    this._detect();
    return this._isNode;
  }
  get isElectronRenderer() {
    this._detect();
    return this._isElectronRenderer;
  }
  get isWebWorker() {
    this._detect();
    return this._isWebWorker;
  }
  get isElectronNodeIntegrationWebWorker() {
    this._detect();
    return this._isElectronNodeIntegrationWebWorker;
  }`,
  },
];

export const vsCodeRepo: Repo = {
  label: "vsCode",
  url: "https://github.com/microsoft/vscode",
  files: files,
};
