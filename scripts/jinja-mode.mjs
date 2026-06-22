#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const DEFAULT_CONFIG_PATH = "proyectos/www.flowerhome.com.tw/jinja.config.json";
const JINJA_COMMIT_PREFIX = "chore(jinja):";

function parseArgs(argv) {
  const options = {
    configPath: DEFAULT_CONFIG_PATH,
    dryRun: false,
    force: false,
    now: new Date(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--config") {
      options.configPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (value === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (value === "--force") {
      options.force = true;
      continue;
    }

    if (value === "--now") {
      const nextValue = argv[index + 1];
      if (!nextValue) {
        throw new Error("Missing value for --now");
      }

      const parsedDate = new Date(nextValue);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date for --now: ${nextValue}`);
      }

      options.now = parsedDate;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return options;
}

function normalizeHeading(heading) {
  return heading.replace(/\s+/g, " ").trim();
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Config must be a JSON object");
  }

  if (typeof config.htmlPath !== "string" || config.htmlPath.length === 0) {
    throw new Error("Config requires a non-empty htmlPath");
  }

  if (!Number.isInteger(config.intervalMinutes) || config.intervalMinutes <= 0) {
    throw new Error("Config requires a positive intervalMinutes");
  }

  if (!Array.isArray(config.targets) || config.targets.length !== 2) {
    throw new Error("Config requires exactly 2 target headings");
  }

  if (
    !Array.isArray(config.stateCycle) ||
    config.stateCycle.length !== 4 ||
    config.stateCycle.some((state) => typeof state !== "string" || state.length !== config.targets.length)
  ) {
    throw new Error("Config requires 4 explicit states in stateCycle, one bit per target");
  }
}

function getLastJinjaCommitDate(relativeHtmlPath) {
  const stdout = execFileSync(
    "git",
    [
      "log",
      "--fixed-strings",
      "--grep",
      JINJA_COMMIT_PREFIX,
      "-1",
      "--format=%cI",
      "--",
      relativeHtmlPath,
    ],
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  ).trim();

  return stdout || null;
}

function isDue({ force, intervalMinutes, now, relativeHtmlPath }) {
  if (force) {
    return {
      due: true,
      forced: true,
      lastAppliedAt: null,
      elapsedMinutes: null,
    };
  }

  const lastAppliedAt = getLastJinjaCommitDate(relativeHtmlPath);
  if (!lastAppliedAt) {
    return {
      due: true,
      forced: false,
      lastAppliedAt: null,
      elapsedMinutes: null,
    };
  }

  const elapsedMilliseconds = now.getTime() - new Date(lastAppliedAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60000);

  return {
    due: elapsedMilliseconds >= intervalMinutes * 60000,
    forced: false,
    lastAppliedAt,
    elapsedMinutes,
  };
}

function getDocumentLanguage(html) {
  const match = html.match(/<html\b[^>]*\blang="([^"]+)"/i);
  if (!match) {
    throw new Error("Unable to find <html lang=\"...\"> in target HTML");
  }

  return match[1];
}

function getLocalizedPieces(lang, now) {
  return {
    day: new Intl.DateTimeFormat(lang, { day: "numeric", timeZone: "UTC" }).format(now),
    month: new Intl.DateTimeFormat(lang, { month: "long", timeZone: "UTC" }).format(now),
    year: new Intl.DateTimeFormat(lang, { year: "numeric", timeZone: "UTC" }).format(now),
  };
}

function formatLocalizedDate(lang, now) {
  const pieces = getLocalizedPieces(lang, now);
  const baseLanguage = lang.toLowerCase().split("-")[0];

  if (baseLanguage === "es") {
    return `${pieces.day} de ${pieces.month}, ${pieces.year}`;
  }

  if (baseLanguage === "it") {
    return `${pieces.day} ${pieces.month}, ${pieces.year}`;
  }

  if (baseLanguage === "nb" || baseLanguage === "nn" || baseLanguage === "no") {
    return `${pieces.day.replace(/\.$/u, "")}. ${pieces.month}, ${pieces.year}`;
  }

  if (baseLanguage === "sv") {
    return `${pieces.day} ${pieces.month}, ${pieces.year}`;
  }

  if (baseLanguage === "ar") {
    return `${pieces.day} ${pieces.month}، ${pieces.year}`;
  }

  return new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);
}

function replaceTimeTag(html, now, lang) {
  const dateValue = now.toISOString().slice(0, 10);
  const displayValue = formatLocalizedDate(lang, now);
  const timePattern = /<time\b([^>]*?)datetime="([^"]+)"([^>]*)>[\s\S]*?<\/time>/i;

  if (!timePattern.test(html)) {
    throw new Error("Unable to find the target <time> tag in HTML");
  }

  return html.replace(
    timePattern,
    (_match, beforeDatetime, _oldDateValue, afterDatetime) =>
      `<time${beforeDatetime}datetime="${dateValue}"${afterDatetime}>${displayValue}</time>`,
  );
}

function collectSections(html) {
  const sectionPattern = /^([ \t]*)(<!--\s*)?<h2>(.*?)<\/h2>/gm;
  const starts = [];

  for (const match of html.matchAll(sectionPattern)) {
    starts.push({
      index: match.index,
      indent: match[1] ?? "",
      commented: Boolean(match[2]),
      heading: normalizeHeading(match[3] ?? ""),
    });
  }

  if (starts.length === 0) {
    throw new Error("No <h2> sections found in target HTML");
  }

  return starts.map((start, index) => {
    const end = starts[index + 1]?.index ?? html.length;
    return {
      ...start,
      end,
      source: html.slice(start.index, end),
    };
  });
}

function splitBodyAndWhitespace(source) {
  const trailingWhitespace = source.match(/\s*$/u)?.[0] ?? "";
  return {
    body: source.slice(0, source.length - trailingWhitespace.length),
    trailingWhitespace,
  };
}

function commentSection(source) {
  const { body, trailingWhitespace } = splitBodyAndWhitespace(source);
  if (body.trimStart().startsWith("<!--")) {
    return source;
  }

  const indent = body.match(/^([ \t]*)/u)?.[1] ?? "";
  const visibleBody = body.slice(indent.length).trimEnd();

  return `${indent}<!-- ${visibleBody} -->${trailingWhitespace}`;
}

function uncommentSection(source) {
  const { body, trailingWhitespace } = splitBodyAndWhitespace(source);
  if (!body.trimStart().startsWith("<!--")) {
    return source;
  }

  const indent = body.match(/^([ \t]*)/u)?.[1] ?? "";
  const uncommentedBody = body
    .replace(/^[ \t]*<!--\s*/u, "")
    .replace(/\s*-->\s*$/u, "");

  return `${indent}${uncommentedBody}${trailingWhitespace}`;
}

function buildState(config, sectionsByHeading) {
  return config.targets
    .map((heading) => {
      const section = sectionsByHeading.get(normalizeHeading(heading));
      if (!section) {
        throw new Error(`Missing configured heading: ${heading}`);
      }

      return section.commented ? "1" : "0";
    })
    .join("");
}

function getNextState(config, currentState) {
  const currentIndex = config.stateCycle.indexOf(currentState);
  if (currentIndex === -1) {
    throw new Error(`Current state ${currentState} is not present in stateCycle`);
  }

  return config.stateCycle[(currentIndex + 1) % config.stateCycle.length];
}

function applyState(html, config, nextState) {
  const sections = collectSections(html);
  const sectionsByHeading = new Map();

  for (const section of sections) {
    if (sectionsByHeading.has(section.heading)) {
      throw new Error(`Duplicate <h2> heading found: ${section.heading}`);
    }

    sectionsByHeading.set(section.heading, section);
  }

  const replacements = config.targets.map((heading, index) => {
    const normalizedHeading = normalizeHeading(heading);
    const section = sectionsByHeading.get(normalizedHeading);
    if (!section) {
      throw new Error(`Configured heading not found in HTML: ${heading}`);
    }

    const targetCommented = nextState[index] === "1";
    const replacement = targetCommented ? commentSection(section.source) : uncommentSection(section.source);

    return {
      start: section.index,
      end: section.end,
      replacement,
    };
  });

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (currentHtml, replacement) =>
        `${currentHtml.slice(0, replacement.start)}${replacement.replacement}${currentHtml.slice(replacement.end)}`,
      html,
    );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(REPO_ROOT, options.configPath);
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));

  validateConfig(config);

  const htmlPath = path.resolve(REPO_ROOT, config.htmlPath);
  const relativeHtmlPath = path.relative(REPO_ROOT, htmlPath);
  const dueStatus = isDue({
    force: options.force,
    intervalMinutes: config.intervalMinutes,
    now: options.now,
    relativeHtmlPath,
  });

  if (!dueStatus.due) {
    console.log(
      JSON.stringify(
        {
          changed: false,
          reason: "interval-not-reached",
          intervalMinutes: config.intervalMinutes,
          lastAppliedAt: dueStatus.lastAppliedAt,
          elapsedMinutes: dueStatus.elapsedMinutes,
        },
        null,
        2,
      ),
    );
    return;
  }

  const originalHtml = await fs.readFile(htmlPath, "utf8");
  const language = getDocumentLanguage(originalHtml);
  const timeUpdatedHtml = replaceTimeTag(originalHtml, options.now, language);
  const currentSectionsByHeading = new Map(
    collectSections(timeUpdatedHtml).map((section) => [section.heading, section]),
  );
  const currentState = buildState(config, currentSectionsByHeading);
  const nextState = getNextState(config, currentState);
  const nextHtml = applyState(timeUpdatedHtml, config, nextState);

  if (!options.dryRun) {
    await fs.writeFile(htmlPath, nextHtml, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        changed: nextHtml !== originalHtml,
        dryRun: options.dryRun,
        forced: dueStatus.forced,
        htmlPath: relativeHtmlPath,
        lang: language,
        currentState,
        nextState,
        targets: config.targets,
        renderedDate: formatLocalizedDate(language, options.now),
        isoDate: options.now.toISOString().slice(0, 10),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
