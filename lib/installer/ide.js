/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as utils from '../utils';

import semver from 'semver';


const SOURCE_MASTER_BRANCH = 'master';
const SOURCE_DEVELOP_BRANCH = 'develop';

export async function checkIDEUpdates() {
  if (!navigator.onLine) {
    return;
  }

  const branch = getSourceBranch();
  const current = utils.getIDEVersion();

  let latest = null;
  try {
    latest = await fetchLatestIDEVersion(branch);
  } catch (err) {
    console.error(err);
    return;
  }

  if (!latest || semver.lte(latest, current)) {
    return;
  }

  if (atom.config.get('platformio-ide.autoUpdateIDE')) {
    try {
      return await upgradeIDE(branch);
    } catch (err) {
      console.error(err);
    }
  }

  const selected = atom.confirm({
    message: `Your IntoYunIoT IDE v${current} is out of date!`,
    detailedMessage: `Upgrade now to v${latest} for better performance and stability.`,
    buttons: ['Upgrade', 'Ask later']
  });
  if (selected === 0) {
    try {
      return await upgradeIDE(branch);
    } catch (err) {
      utils.notifyError(
        'Problem occured while upgrading IntoYunIoT IDE',
        new Error(err)
      );
    }
  }
}

function getSourceBranch() {
  if (atom.config.get('platformio-ide.advanced.useDevelopmentIDE')) {
    return SOURCE_DEVELOP_BRANCH;
  }
  const manifest = utils.getIDEManifest();
  if (manifest.apmInstallSource && manifest.apmInstallSource.type === 'git') {
    return SOURCE_DEVELOP_BRANCH;
  }
  return SOURCE_MASTER_BRANCH;
}

function fetchLatestIDEVersion(branch) {
  return new Promise((resolve, reject) => {
    utils.processHTTPRequest(
      {
        url: `https://raw.githubusercontent.com/huangguozhen/intoyuniot-atom-ide/${branch}/package.json`
      },
      (err, response, body) => err ? reject(err) : resolve(JSON.parse(body).version)
    );
  });
}

function upgradeIDE(branch) {
  let args = null;
  switch (branch) {
    case SOURCE_DEVELOP_BRANCH:
      args = ['install', '--production', 'IntoYun/intoyuniot-atom-ide'];
      break;

    case SOURCE_MASTER_BRANCH:
      args = ['upgrade', 'intoyuniot-ide', '--compatible', '--no-confirm'];
      break;
  }
  if (!args) {
    return;
  }
  return new Promise((resolve, reject) => {
    utils.runAPMCommand(
      args,
      (code, stdout, stderr) => {
        if (code === 0) {
          atom.notifications.addSuccess(
            'IntoYunIoT更新完成',
            {
              detail: '请重启Atom生效。',
              buttons: [
                {
                  text: '重启',
                  onDidClick: () => atom.restartApplication()
                }
              ],
              dismissable: true
            }
          );
          return resolve(true);
        } else {
          return reject(stderr);
        }
      },
      {
        busyTitle: '升级IntoYunIoT IDE'
      }
    );
  });
}

export async function reinstallIDE(useDevelop) {
  try {
    await new Promise((resolve, reject) => {
      utils.runAPMCommand(
        ['uninstall', 'intoyuniot-ide'],
        (code, stdout, stderr) => code === 0 ? resolve(stdout) : reject(stdout.toString() + stderr.toString()),
        {
          busyTitle: 'Uninstalling IntoYunIoT IDE'
        }
      );
    });
    await new Promise((resolve, reject) => {
      utils.runAPMCommand(
        [
          'install',
          '--production',
          useDevelop ? 'IntoYUn/intoyuniot-atom-ide' : 'intoyuniot-ide'
        ],
        (code, stdout, stderr) => code === 0 ? resolve(stdout) : reject(stdout.toString() + stderr.toString()),
        {
          busyTitle: '安装IntoYunIoT IDE'
        }
      );
    });

  } catch (err) {
    utils.notifyError(
      'Problem has been occured while installing IntoYunIoT IDE.',
      new Error(err)
    );
    return false;
  }

  atom.notifications.addSuccess(
    'IntoYunIoT IDE安装成功!',
    {
      detail: '请重启Atom生效',
      buttons: [
        {
          text: '重启',
          onDidClick: () => atom.restartApplication()
        }
      ],
      dismissable: true
    }
  );
  return true;
}
