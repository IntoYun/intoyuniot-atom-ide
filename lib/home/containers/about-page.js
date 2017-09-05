/** @babel */

/**
 * Copyright (c) 2016-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PioVersions from './pio-versions';
import PlatformIOLogo from '../components/pio-logo';
import React from 'react';


export default class AboutPage extends React.Component {
  render() {
    return (
      <section className='page-container about-page'>
        <h1><a href='http://www.intoyun.com'>IntoYunIoT</a></h1>
        <h2>An open source ecosystem for IoT development</h2>
        <div className="block logo">
          <a href='http://www.intoyun.com'><PlatformIOLogo /></a>
        </div>
        <PioVersions />
        <div className='block text-smaller'>
          Copyright (C) 2014-
          { new Date().getFullYear() } IntoYunIoT. All rights reserved.
        </div>
      </section>
    );
  }
}
