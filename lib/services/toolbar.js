/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { Disposable } from 'atom';


let currentService = null;

export function ToolbarConsumer(toolBar) {
  if (currentService) {
    return;
  }
  currentService = toolBar('platformio-ide');

  currentService.addButton({
    icon: 'home',
    callback: 'platformio-ide:home',
    tooltip: '首页'
  });

  currentService.addButton({
    icon: 'check',
    callback: 'platformio-ide:target:build',
    tooltip: '编译'
  });

  currentService.addButton({
    icon: 'arrow-right',
    callback: 'platformio-ide:target:upload',
    tooltip: '烧录'
  });

  currentService.addButton({
    icon: 'trashcan',
    callback: 'platformio-ide:target:clean',
    tooltip: '清除'
  });

  // currentService.addButton({
  //   icon: 'bug',
  //   callback: 'platformio-ide:target:debug',
  //   tooltip: '调试'
  // });

  // currentService.addButton({
  //   icon: 'checklist',
  //   callback: 'build:select-active-target',
  //   tooltip: '运行其他'
  // });

  currentService.addButton({
    icon: 'fold',
    callback: 'build:toggle-panel',
    tooltip: '编译面板'
  });

  currentService.addSpacer();

  currentService.addButton({
    icon: 'file-code',
    callback: 'platformio-ide:initialize-new-project',
    tooltip: '新建或更新工程'
  });

  currentService.addButton({
    icon: 'file-directory',
    callback: 'application:add-project-folder',
    tooltip: '打开工程目录'
  });

  currentService.addButton({
    icon: 'search',
    callback: 'project-find:show',
    tooltip: '在工程中查找'
  });

  currentService.addSpacer();

  currentService.addButton({
    icon: 'terminal',
    callback: 'platformio-ide:maintenance.open-terminal',
    tooltip: '终端'
  });

  currentService.addButton({
    icon: 'plug',
    callback: 'platformio-ide:maintenance.serial-monitor',
    tooltip: '串口监控'
  });

  currentService.addSpacer();

  currentService.addButton({
    icon: 'gear',
    callback: 'application:show-settings',
    tooltip: '设置'
  });

  return new Disposable(() => {
    currentService.removeItems();
    currentService = null;
  });
}
