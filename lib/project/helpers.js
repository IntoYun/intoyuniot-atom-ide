/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fsExtra from 'fs-extra';
import ini from 'ini';
import fs from 'fs-plus';
import path from 'path';


const RECENT_PROJECTS_MAX = 30;
const RECENT_PROJECTS_KEY = 'platformio-ide:recent-projects';

export function synchronizeRecentProjects(items) {
  const result = getRecentProjects();
  for (const item of items) {
    if (!result.includes(item) && !item.startsWith('atom:')) {
      result.unshift(item);
    }
  }
  setRecentProjects(result);
}

export function getRecentProjects() {
  const items = localStorage.getItem(RECENT_PROJECTS_KEY);
  if (!items) {
    return [];
  }
  return JSON.parse(items);
}

function setRecentProjects(items) {
  localStorage.setItem(
    RECENT_PROJECTS_KEY,
    JSON.stringify(items.slice(0, RECENT_PROJECTS_MAX))
  );
}

export function removeRecentProject(item) {
  setRecentProjects(getRecentProjects().filter(_item => _item !== item));
}

export function isPioProject(dir) {
  return fs.isFileSync(path.join(dir, 'intoyuniot.ini'));
}

export function getPioProjects() {
  return atom.project.getPaths().filter(p => isPioProject(p));
}

export function getActivePioProject() {
  const paths = getPioProjects();
  if (paths.length === 0) {
    return null;
  }
  const editor = atom.workspace.getActiveTextEditor();
  if (editor) {
    const filePath = editor.getPath();
    if (filePath) {
      const found = paths.find(p => filePath.startsWith(p + path.sep));
      if (found) {
        return found;
      }
    }
  }
  return paths[0];
}

export function updateProjectIni (board, protocol, serial, projectPath) {
  const eol = process.platform === 'win32' ? '\r\n' : '\n';
  projectPath = projectPath ? projectPath : getActivePioProject();
  const iniPath = path.join(projectPath, 'intoyuniot.ini');

  let iniString = `[env:${board.id}]${eol}`;
  iniString += `platform = ${board.platform}${eol}`;
  iniString += `board = ${board.id}${eol}`;
  iniString += `framework = ${board.frameworks[0]}${eol}`;

  if (board.platform === 'ststm32') {
    iniString += `upload_protocol = ${protocol}${eol}`;
  }

  if (protocol != 'stlink' && serial) {
    iniString += `upload_port = ${serial}${eol}`;
  }

  fs.writeFileSync(iniPath, iniString, 'utf-8');
}

export function getIniObject () {
  if (!getActivePioProject()) {
    return { 'env:intorobot': {} };
  }

  const iniPath = path.join(getActivePioProject(), 'intoyuniot.ini');
  const iniConfig = fsExtra.readFileSync(iniPath).toString();
  return ini.parse(iniConfig);
}
