/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getBoards, getDevices, removeChildrenOf, withTemplate} from '../utils';
import BaseView from '../base-view';
import {BoardsSelectView} from '../boards-select/view';

@withTemplate(__dirname)
export class ProjectExamplesView extends BaseView {
  initialize(projects) {
    this.projects = projects;

    this.projectsSelect = this.element.querySelector('.projects-select');
    this.selectedProjectsUl = this.element.querySelector('.selected-projects');
    this.placeholder = this.element.querySelector('.selected-placeholder');
    this.prepareButton = this.element.querySelector('.do-prepare');
    this.cancelButton = this.element.querySelector('.cancel');
    this.progress = this.element.querySelector('.pio-project-examples-progress');
    this.currentStatus = this.element.querySelector('.current-status');
    this.commandStatusWrapper = this.element.querySelector('.command-status');
    this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
    this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');
    // 开发板/模组，串口选择容器。
    this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
    this.serialSelect = this.element.querySelector('.serial-select');

    // 增加选择例子存放目录
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');

    // 增加开发板/模组选择, 串口选择
    this.initializeBoardsSelect();
    this.initializeDevicesSelect();
    this.element.querySelector('#stlink').onchange = ({ target: { checked } }) => {
      if (checked) {
        this.serialSelect.style.display = 'none';
      }
    };
    this.element.querySelector('#dfu').onchange = ({ target: { checked } }) => {
      if (checked) {
        this.serialSelect.style.display = 'block';
      }
    };

    // Set handlers
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
        this.updatePrepareButtonDisabled();
      });
    };

    this.allProjects = {};
    this.selectedProjects = new Set();

    this.projectsSelect.onchange = (event) => {
      this.selectedProjects.clear();
      this.selectedProjects.add(event.target.value);
      // this.filterChoices();
      // this.renderSelected();
      this.updatePrepareButtonDisabled();
    };
    this.prepareButton.onclick = () => this.handlePrepare();
    this.cancelButton.onclick = () => this.handleCancel();

    this.setProjects(projects);
  }

  initializeBoardsSelect() {
    const boards = getBoards();
    removeChildrenOf(this.boardsSelectWrapper);
    this.boardsSelect = new BoardsSelectView(boards);
    this.boardsSelectWrapper.appendChild(this.boardsSelect.getElement());

    // 处理下载方式单选按钮
    this.boardsSelect.handleSelectBoard = () => {
      const [ boardIndex ] = this.getSelectedBoards();
      const board = boards[boardIndex];

      console.log(board);

      this.updateUploadButtonDisabled(board);
    };
  }

  getSelectedBoards() {
    return this.boardsSelect.getSelectedBoards();
  }

  updateUploadButtonDisabled (board) {
    const dfuWrapper = this.element.querySelector('.dfuWrapper');
    const stlinkWrapper = this.element.querySelector('.stlinkWrapper');
    const serialWrapper = this.element.querySelector('.serialWrapper');

    if (board.platform === 'ststm32') {
      serialWrapper.style.display = 'none';
      dfuWrapper.style.display = 'block';
      stlinkWrapper.style.display = 'block';

      const protocol = board.upload_protocol || 'dfu';
      this.element.querySelector(`#${protocol}`).checked = true;
      if (protocol === 'stlink') {
        this.serialSelect.style.display = 'none';
      }
    } else {
      serialWrapper.style.display = 'block';
      dfuWrapper.style.display = 'none';
      stlinkWrapper.style.display = 'none';
      this.serialSelect.style.display = 'block';
      this.element.querySelector('#serial').checked = true;
    }
  }

  // 初始化串口列表
  initializeDevicesSelect () {
    const devices = getDevices();
    const defaultOption = document.createElement('option');
    defaultOption.textContent = '自动选择';
    defaultOption.selected = true;
    defaultOption.value = '';

    this.serialSelect.appendChild(defaultOption);
    devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.port;
      option.textContent = device.port;

      this.serialSelect.appendChild(option);
    });
  }

  getSelectedProjects() {
    return this.selectedProjects;
  }

  setProjects(projects) {
    this.allProjects = projects;
    this.filterChoices();
  }

  filterChoices() {
    var defaultOption = document.createElement('option');
    defaultOption.textContent = '-- add project --';
    defaultOption.selected = true;
    defaultOption.disabled = true;

    const sortedKeys = Object.keys(this.allProjects).sort((a, b) => {
      if (this.allProjects[a] > this.allProjects[b]) {
        return 1;
      } else if (this.allProjects[a] < this.allProjects[b]) {
        return -1;
      } else {
        return 0;
      }
    });

    removeChildrenOf(this.projectsSelect);
    this.projectsSelect.appendChild(defaultOption);

    for (const projectPath of sortedKeys) {
      if (this.selectedProjects.has(projectPath)) {
        continue;
      }

      const option = document.createElement('option');
      option.value = projectPath;
      option.textContent = this.allProjects[projectPath];
      this.projectsSelect.appendChild(option);
    }
  }

  renderSelected() {
    this.checkPlaceholderAndUlVisibility();
    removeChildrenOf(this.selectedProjectsUl);
    this.selectedProjects.forEach((projectPath) => {
      this.selectedProjectsUl.appendChild(this.createSelected(projectPath));
    });
  }

  checkPlaceholderAndUlVisibility() {
    if (this.selectedProjects.length < 1) {
      this.placeholder.style.display = 'block';
      this.selectedProjectsUl.style.display = 'none';
    } else {
      this.placeholder.style.display = 'none';
      this.selectedProjectsUl.style.display = 'block';
    }
  }

  createSelected(projectPath) {
    const
      li = document.createElement('li'),
      name = document.createElement('span'),
      icon = document.createElement('span'),
      unselect = document.createElement('a');

    li['data-project-path'] = projectPath;

    name.textContent = this.allProjects[projectPath];

    icon.classList.add('icon');
    icon.classList.add('icon-x');

    unselect.href = '#';
    unselect.classList.add('unselect');
    unselect.onclick = (e) => this.handleRemove(e);
    unselect.appendChild(icon);

    li.appendChild(name);
    li.appendChild(unselect);

    return li;
  }

  handleRemove(event) {
    this.selectedProjects.delete(event.target.parentNode.parentNode['data-project-path']);
    event.target.parentNode.parentNode.remove();
    this.checkPlaceholderAndUlVisibility();
    this.filterChoices();
    this.updatePrepareButtonDisabled();
  }

  updatePrepareButtonDisabled() {
    const projectSelected = this.selectedProjects.size > 0;
    const directorySelected = this.directorySelect.value.toString().length > 0;

    this.prepareButton.disabled = !projectSelected || !directorySelected;
  }

  setStatus(text) {
    this.commandStatusWrapper.style.display = 'block';
    this.commandStatusContent.textContent = text;
  }

  addDirectories(directories, activeDir) {
    for (const dir of directories) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      if (dir == activeDir) {
        option.selected = true;
      }
      this.directorySelect.appendChild(option);
    }
  }

  getDirectory() {
    return this.directorySelect.value;
  }

  getSerial () {
    return this.serialSelect.value;
  }

  getProtocol () {
    let protocol = '';
    const radio = this.element.querySelectorAll('input[name="uploadProtocol"]');
    for (let i = 0; i < radio.length; i++) {
      if (radio[i].checked) {
        protocol = radio[i].value;
        break;
      }
    }

    return protocol;
  }
}
