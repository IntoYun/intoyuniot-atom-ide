/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getBoards, getDevices, removeChildrenOf, withTemplate} from '../utils';
import { getIniObject } from '../project/helpers';
import BaseView from '../base-view';
import {BoardsSelectView} from '../boards-select/view';

@withTemplate(__dirname)
export class InitializeNewProjectView extends BaseView {

  initialize() {
    // Find important nodes
    this.boardsSelectWrapper = this.element.querySelector('.boards-select-wrapper');
    this.directorySelect = this.element.querySelector('.directory-select');
    this.otherDirectoryButton = this.element.querySelector('.other-directory');
    this.doInitButton = this.element.querySelector('.controls .do-init');
    this.cancelButton = this.element.querySelector('.controls .cancel');
    this.commandStatusWrapper = this.element.querySelector('.command-status');
    this.commandStatusContent = this.commandStatusWrapper.querySelector('.content');
    this.commandStatusSpinner = this.commandStatusWrapper.querySelector('.icon');

    // 串口选择元素
    this.serialSelect = this.element.querySelector('.serial-select');
    this.element.querySelector("#stlink").onchange = ({ target: { checked } }) => {
      if (checked) {
        this.serialSelect.style.display = 'none';
      }
    };
    this.element.querySelector('#dfu').onchange = ({ target: { checked } }) => {
      if (checked) {
        this.serialSelect.style.display = 'block';
      }
    }

    console.log(getIniObject());

    // Set handlers
    this.otherDirectoryButton.onclick = () => {
      atom.pickFolder((selectedPaths) => {
        if (!selectedPaths) {
          return;
        }
        this.addDirectories(selectedPaths, selectedPaths[selectedPaths.length - 1]);
        this.updateInitButtonDisabled();
      });
    };
    this.doInitButton.onclick = () => {
      this.doInitButton.textContent = '处理中...';
      this.doInitButton.disabled = true;
      this.handleInit();
    };
    this.cancelButton.onclick = () => this.handleCancel();

    this.initializeBoardsSelect();
    this.initializeDevicesSelect();
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

      this.updateUploadButtonDisabled(board);
      this.updateInitButtonDisabled();
    };
  }

  updateUploadButtonDisabled (board) {
    const dfuWrapper = this.element.querySelector('.dfuWrapper');
    const stlinkWrapper = this.element.querySelector('.stlinkWrapper');
    const serialWrapper = this.element.querySelector('.serialWrapper');

    if (board.platform === 'ststm32') {
      serialWrapper.style.display = 'none';
      dfuWrapper.style.display = 'block';
      stlinkWrapper.style.display = 'block';
      this.element.querySelector('#dfu').checked = true;
    } else {
      serialWrapper.style.display = 'block';
      dfuWrapper.style.display = 'none';
      stlinkWrapper.style.display = 'none';
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
    })
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

  getDirectory() {
    return this.directorySelect.value;
  }

  getSelectedBoards() {
    return this.boardsSelect.getSelectedBoards();
  }

  updateInitButtonDisabled() {
    const boardsSelected = this.boardsSelect && this.getSelectedBoards().size > 0;
    const directorySelected = this.directorySelect.value.toString().length > 0;
    this.doInitButton.disabled = !boardsSelected || !directorySelected;
  }

  setStatus(text) {
    this.commandStatusWrapper.style.display = 'block';
    this.commandStatusContent.textContent = text;
  }

  setTitle (text) {
    const title = this.element.querySelector('.pio-init .title');
    title.textContent = text;
  }

  hideDirectorySelect () {
    this.element.querySelector('.directory-select-wrapper').style.display = 'none';
  }

  handleInit() {}
  handleCancel() {}
}
