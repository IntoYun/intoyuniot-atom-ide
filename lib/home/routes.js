/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AboutPage from './containers/about-page';
// import AccountIndex from '../account/index';
import BoardsPage from '../platform/containers/boards-page';
import LibraryIndex from '../library/index';
import PlatformPage from '../platform/index';
import WelcomePage from './containers/welcome-page';


const routes = [{
  path: '/',
  icon: 'home',
  label: '首页',
  component: WelcomePage
 }, {
   path: '/lib',
   icon: 'code',
   label: '公共库',
   component: LibraryIndex
}, {
  path: '/boards',
  icon: 'circuit-board',
  label: '开发板/模组',
  component: BoardsPage
}, {
  path: '/platform',
  icon: 'device-desktop',
  label: '硬件平台',
  component: PlatformPage
}, {
  path: '/about',
  component: AboutPage
}];



export default routes;
