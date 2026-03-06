// Copyright (c) - Graphical Playground. All rights reserved.

'use strict';

import fs from 'node:fs';
import path from 'node:path';
// Use: import pdflib from 'pdf-lib';

/** Common Types */
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type TimeUnits = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

/**
 *
 */
interface Lesson {
  /** Private Section */
  _path: string;
  _meta: string;
}

/**
 *
 */
interface Chapter {
  /** Private Section */
  _path: string;
  _meta: string;

  /** Children */
  lessons: Lesson[];
}

/**
 *
 */
interface Module {
  /** Private Section */
  _path: string;
  _meta: string;

  /** Children */
  chapters: Chapter[];
}

/**
 *
 */
interface Tier {
  /** Private Section */
  _path: string;
  _meta: {
    number: number;
    title: string;
    slug: string;
    tagline: string;
    description: string;
    color: string;
    estimatedTime: {
      min: number;
      max: number;
      unit: TimeUnits;
    };
    prerequisites: string[];
    tags: string[];
    difficulty: Difficulty;
    certificate: boolean;
  };

  /** Children */
  modules: Module[];
}

/**
 *
 * @param parentPath
 * @returns
 */
const getSubDirectories = (parentPath: string): string[] => {
  if (!fs.existsSync(parentPath)) return [];
  return fs
    .readdirSync(parentPath)
    .map((name) => path.join(parentPath, name))
    .filter((fullPath) => fs.statSync(fullPath).isDirectory());
};

/**
 *
 * @param dirPath
 * @returns
 */
const readMeta = (dirPath: string) => {
  const metaPath = path.join(dirPath, '_meta.json');
  return fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf-8')) : '';
};

/**
 *
 * @param lessonPath
 * @returns
 */
function parseLesson(lessonPath: string): Lesson {
  return {
    _path: lessonPath,
    _meta: readMeta(lessonPath)
  };
}

/**
 *
 * @param chapterPath
 * @returns
 */
function parseChapter(chapterPath: string): Chapter {
  return {
    _path: chapterPath,
    _meta: readMeta(chapterPath),
    lessons: getSubDirectories(chapterPath).map(parseLesson)
  };
}

/**
 *
 * @param modulePath
 * @returns
 */
function parseModule(modulePath: string): Module {
  return {
    _path: modulePath,
    _meta: readMeta(modulePath),
    chapters: getSubDirectories(modulePath).map(parseChapter)
  };
}

/**
 *
 * @param tierPath
 * @returns
 */
function parseTier(tierPath: string): Tier {
  return {
    _path: tierPath,
    _meta: readMeta(tierPath),
    modules: getSubDirectories(tierPath).map(parseModule)
  };
}

/**
 *
 * @returns
 */
function getCurriculumContent(): Tier[] {
  const contentRoot = path.resolve('content');
  return getSubDirectories(contentRoot).map(parseTier);
}

console.log('Generating handbook...');

console.log(JSON.stringify(getCurriculumContent(), null, 2));
