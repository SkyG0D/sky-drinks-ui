import { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useTitle } from 'src/hooks/useTitle';

import styles from './styles.module.scss';
import { ListDrinks } from '../components/ListDrinks';

export function SearchDrinks(): JSX.Element {
  useTitle('SkyDrinks - Pesquisar bebidas');

  const [drawerVisible, setDrawerVisible] = useState(false);

  function openDrawer(): void {
    setDrawerVisible(true);
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Pesquisar bebida</h2>

      <div className={styles.fullButton}>
        <Button type="primary" icon={<SearchOutlined />} onClick={openDrawer}>
          Pesquise sua bebida
        </Button>
      </div>

      <ListDrinks
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      />
    </section>
  );
}
