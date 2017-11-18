/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';
import * as config from '../config';
import { ProjectExamplesView } from './view';
import { getActivePioProject, updateProjectIni } from '../project/helpers';
import fs from 'fs-plus';
import path from 'path';


export async function command() {
  const projects = await getProjects(path.join(config.PIO_HOME_DIR, 'project-examples'));
  const view = new ProjectExamplesView(projects);
  const panel = atom.workspace.addModalPanel({
    item: view.getElement()
  });
  let canceled = false;

  view.handlePrepare = async function() {
    const boards = utils.getBoards();
    const protocol = view.getProtocol();
    const serial = view.getSerial();
    const [ index ] = view.getSelectedBoards();

    const projects = view.getSelectedProjects();
    const basePath = view.getDirectory();
    let step = 0;
    let newPath = '';
    const processedPaths = [];
    view.progress.max = projects.size;
    view.progress.style.display = 'block';
    for (const projectPath of projects) {
      view.progress.value = step;
      step += 1;
      if (!canceled) {
        view.setStatus(`创建工程："${path.basename(projectPath)}"`);
        newPath = path.join(basePath, path.basename(projectPath));

        fs.copySync(projectPath, newPath);
        atom.project.addPath(newPath);
        processedPaths.push(newPath);
      }
      view.progress.value = step;
      // 更新配置文件
      updateProjectIni(boards[index], protocol, serial, newPath);
    }
    if (canceled) {
      for (const projectPath of processedPaths) {
        atom.project.removePath(projectPath);
      }
    }
    panel.destroy();
  };
  view.handleCancel = function() {
    canceled = true;
    panel.destroy();
  };

  const projectHome = atom.config.get('core.projectHome');
  view.addDirectories([ projectHome ], projectHome);
}

async function getProjects(examplesRoot) {
  const queue = [examplesRoot];
  const projects = {};
  while (queue.length > 0) {
    const dirPath = queue.splice(0, 1)[0]; // take the first element from the queue
    if (!dirPath) {
      continue;
    }
    const files = await fs.readdirSync(dirPath);
    if (files.indexOf('intoyuniot.ini') > -1) {
      projects[dirPath] = dirPath.slice(examplesRoot.length + 1);
      continue;
    }
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        if (fs.isDirectorySync(fullPath) && file !== 'ide') {
          queue.push(fullPath);
        }
      } catch (e) {
        continue;
      }
    }
  }
  return projects;
}
