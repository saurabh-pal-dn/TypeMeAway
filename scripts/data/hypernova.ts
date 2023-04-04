import { Repo, RepoFile } from "./interfaces";

const files: RepoFile[] = [
  {
    path: "src/utils/renderBatch.js",
    code: `
export default (config, isClosing) => (req, res) => {
  if (isClosing()) {
    logger.info('Starting request when closing!');
  }
  const jobs = req.body;
  const manager = new BatchManager(req, res, jobs, config);
  return processBatch(jobs, config.plugins, manager, config.processJobsConcurrently)
    .then(() => {
      if (isClosing()) {
        logger.info('Ending request when closing!');
      }
      return res.status(manager.statusCode).json(manager.getResults()).end();
    })
    .catch(() => res.status(manager.statusCode).end());
};`,
  },
  {
    path: "src/environment.js",
    code: `
function isNotMethod(name) {
  return !(es6methods.includes(name) || es6StaticMethods.includes(name) || name.charAt(0) === '_');
}

function del(obj) {
  return (key) => { delete obj[key]; };
}

function toFastProperties(obj) {
  (function () {}).prototype = obj;
}`,
  },
  {
    path: "src/index.js",
    code: `
function decode(res) {
  const jsonPayload = ENCODE.reduceRight((str, coding) => {
    const [encodeChar, htmlEntity] = coding;
    return str.replace(new RegExp(htmlEntity, 'g'), encodeChar);
  }, res);

  return JSON.parse(jsonPayload);
}`,
  },
];

export const hyperNovaRepo: Repo = {
  label: "HyperNova",
  url: "https://github.com/airbnb/hypernova",
  files: files,
};
