import { useState } from 'react';
import { Typography } from 'antd';
import { Footer } from 'antd/lib/layout/layout';
import { Outlet } from 'react-router-dom';

import { NavMenu } from 'src/components/layout/NavMenu';
import { NavMenuButton } from 'src/components/layout/NavMenu/components/NavMenuButton';
import { TopBar } from 'src/components/layout/TopBar';

import styles from './styles.module.scss';

export function Home(): JSX.Element {
  const [menuShow, setMenuShow] = useState(window.innerWidth > 700);

  return (
    <div className={styles.container}>
      <NavMenu menuShow={menuShow} setMenuShow={setMenuShow} />

      <NavMenuButton menuShow={menuShow} setMenuShow={setMenuShow} />

      <div className={styles.contentContainer}>
        <TopBar />

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>

        <Footer style={{ textAlign: 'center' }}>
          SkyDrinks ©2021 Criado por{' '}
          <Typography.Link
            style={{ color: '#000000', textDecoration: 'underline' }}
            href="https://github.com/SkyG0D"
          >
            SkyG0D
          </Typography.Link>
        </Footer>
      </div>
    </div>
  );
}
