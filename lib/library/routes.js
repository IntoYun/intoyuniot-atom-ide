/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import LibraryBuiltinPage from './containers/builtin-page';
import LibraryDetailPage from './containers/detail-page';
import LibraryInstalledPage from './containers/installed-page';
import LibrarySearchPage from './containers/search-page';
import LibraryStatsPage from './containers/stats-page';
import LibraryUpdatesPage from './containers/updates-page';


const routes = [
  {
    path: '/lib',
    icon: 'book',
    label: '已注册',
    component: LibraryStatsPage
  },
  {
    path: '/lib/registry/show',
    component: LibraryDetailPage
  },
  {
    path: '/lib/registry/search',
    component: LibrarySearchPage
  },
  {
    path: '/lib/builtin',
    icon: 'eye-watch',
    label: '内置库',
    component: LibraryBuiltinPage
  },
  {
    path: '/lib/builtin/show',
    component: LibraryDetailPage
  },
  {
    path: '/lib/installed',
    icon: 'package',
    label: '已安装',
    component: LibraryInstalledPage
  },
  {
    path: '/lib/installed/show',
    component: LibraryDetailPage
  },
  {
    path: '/lib/updates',
    icon: 'cloud-download',
    label: '可升级',
    component: LibraryUpdatesPage
  }
];

export default routes;
