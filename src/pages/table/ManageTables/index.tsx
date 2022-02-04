import { useEffect, useState } from 'react';
import qs from 'query-string';
import { useSearchParams } from 'react-router-dom';
import { useTransition, animated, config } from 'react-spring';

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import {
  Button,
  Divider,
  Drawer,
  Form,
  Modal,
  Pagination,
  Select,
  Slider,
  Tooltip,
} from 'antd';

import endpoints from 'src/api/api';
import { TableIcon } from 'src/components/custom/CustomIcons';
import { useTitle } from 'src/hooks/useTitle';
import { pluralize } from 'src/utils/pluralize';
import { showNotification } from 'src/utils/showNotification';
import { getFieldErrorsDescription, handleError } from 'src/utils/handleError';
import { useCreateParams } from 'src/hooks/useCreateParams';

import { PersistTable } from './PersistTable';

import styles from './styles.module.scss';

interface TableSearchForm {
  seats: number[];
  occupied: number;
}

interface TablePersistForm {
  seats: number;
  number: number;
}

const { confirm } = Modal;
const { Option } = Select;

export function ManageTables(): JSX.Element {
  useTitle('SkyDrinks - Gerenciar mesas');

  const [, setSearchParams] = useSearchParams();

  const [form] = Form.useForm();

  const [drawerVisible, setDrawerVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [persistTableLoading, setPersistTableLoading] = useState(false);
  const [removeTableLoading, setRemoveTableLoading] = useState(false);

  const [persistTableShow, setPersistTableShow] = useState(false);

  const [params, setParams] = useState<TableSearchParams>({});

  const [selectedTable, setSelectedTable] = useState<TableType>();

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
  });

  const [data, setData] = useState<TablePaginetedType>({
    totalElements: 0,
    content: [],
  });

  const transitions = useTransition(data.content, {
    keys: (item) => item.uuid,
    trail: 100,
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    config: config.stiff,
  });

  useCreateParams({
    params: {
      occupied: Number,
      greaterThanOrEqualToSeats: Number,
      lessThanOrEqualToSeats: Number,
    },
    setParams,
    setLoading,
    setPagination,
  });

  useEffect(() => {
    async function loadTables(): Promise<void> {
      const { page, size } = pagination;

      try {
        const dataFound = await endpoints.searchTables({
          ...params,
          page,
          size,
        });

        setSearchParams(
          qs.stringify({
            ...params,
            page,
          })
        );

        setData(dataFound);
      } catch (error: any) {
        handleError({ error, fallback: 'Não foi possível carregar as mesas' });
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      loadTables();
    }
  }, [loading, pagination, params, setSearchParams]);

  function handleRemoveTable(uuid: string): () => void {
    async function remove(): Promise<void> {
      try {
        setRemoveTableLoading(true);

        await endpoints.deleteTable(uuid);

        setData({
          ...data,
          content: data.content.filter((item) => item.uuid !== uuid),
        });

        const isLastElementOfPage =
          data.content.length === 1 && pagination.page > 0;

        if (isLastElementOfPage) {
          setPagination({
            ...pagination,
            page: pagination.page - 1,
          });

          setLoading(true);
        }

        showNotification({
          type: 'success',
          message: 'Mesa removida com sucesso',
        });
      } catch {
        showNotification({
          type: 'warn',
          message: 'Não foi possível remover mesa',
        });
      } finally {
        setRemoveTableLoading(false);
      }
    }

    return () => {
      confirm({
        title: 'Realmente deseja remover esta mesa?',
        okText: 'Sim',
        cancelText: 'Não',
        onOk: remove,
      });
    };
  }

  function openDrawer(): void {
    setDrawerVisible(true);
  }

  function closeDrawer(): void {
    setDrawerVisible(false);
  }

  function handleTableOccupied(uuid: string, occuppied: boolean): () => void {
    async function toggleTableOccupied(): Promise<void> {
      try {
        await endpoints.toggleTableOccupied(uuid);

        const content = data.content.map((item) => {
          if (item.uuid === uuid) {
            return { ...item, occupied: !item.occupied };
          }

          return item;
        });

        setData({ ...data, content });

        const message = occuppied
          ? 'Mesa desocupada com sucesso!'
          : 'Mesa ocupada com sucesso!';

        showNotification({
          type: 'success',
          message,
          duration: 2,
        });
      } catch {
        showNotification({
          type: 'warn',
          message: 'Não foi possível alternar ocupação da mesa',
        });
      }
    }

    return () => {
      const title = occuppied
        ? 'Deseja desocupar a mesa?'
        : 'Deseja ocupar a mesa?';

      confirm({
        title,
        okText: 'Sim',
        cancelText: 'Não',
        onOk: toggleTableOccupied,
      });
    };
  }

  function handlePaginationChange(page: number): void {
    setPagination((oldPagination) => {
      return { ...oldPagination, page: page - 1 };
    });

    setLoading(true);
  }

  function handleFormFinish(values: TableSearchForm): void {
    const { occupied, seats } = values;

    const [greaterThanOrEqualToSeats, lessThanOrEqualToSeats] = seats;

    setParams({
      greaterThanOrEqualToSeats,
      lessThanOrEqualToSeats,
      occupied,
    });

    setPagination({ ...pagination, page: 0 });

    closeDrawer();
    setLoading(true);
  }

  function clearForm(): void {
    form.resetFields();
  }

  function showPersistTable(): void {
    setPersistTableShow(true);
  }

  function closePersistTable(): void {
    setPersistTableShow(false);
    setSelectedTable(undefined);
  }

  function selectTable(uuid: string) {
    return () => {
      const selectedTableFound = data.content.find(
        (item) => item.uuid === uuid
      );

      if (selectedTableFound) {
        setSelectedTable(selectedTableFound);
        showPersistTable();
      }
    };
  }

  async function handleCreateTable(values: TablePersistForm): Promise<void> {
    try {
      setPersistTableLoading(true);

      const table = await endpoints.createTable(values);

      setData({
        ...data,
        content: [...data.content, table],
      });

      showNotification({
        type: 'success',
        message: 'Mesa foi criada com sucesso!',
      });

      closePersistTable();
    } catch (error: any) {
      const description = getFieldErrorsDescription(error);

      handleError({
        error,
        description,
        fallback: 'Não foi criar mesa',
      });
    } finally {
      setPersistTableLoading(false);
    }
  }

  async function updateSelectedTable(values: TablePersistForm): Promise<void> {
    try {
      setPersistTableLoading(true);

      await endpoints.updateTable({
        ...values,
        uuid: selectedTable?.uuid || '',
      });

      const content = data.content.map((item) => {
        if (item.uuid === selectedTable?.uuid) {
          const { seats, number } = values;
          return { ...item, seats, number };
        }

        return item;
      });

      setData({
        ...data,
        content,
      });

      showNotification({
        type: 'success',
        message: 'Mesa foi atualizada com sucesso!',
      });

      closePersistTable();
    } catch (error: any) {
      const description = getFieldErrorsDescription(error);

      handleError({
        error,
        description,
        fallback: 'Não foi atualizar mesa',
      });
    } finally {
      setPersistTableLoading(false);
    }
  }

  const drawerWidth = window.innerWidth <= 400 ? 300 : 400;

  return (
    <section className={styles.container}>
      <div>
        <h2 className={styles.title}>Gerenciar Mesas</h2>
      </div>

      <div className={styles.fullButton}>
        <Button type="primary" icon={<SearchOutlined />} onClick={openDrawer}>
          Pesquisar mesas
        </Button>
      </div>

      <ul className={styles.list}>
        {transitions((style, { uuid, number, occupied, seats }) => (
          <animated.li style={style}>
            <div className={styles.table}>
              <Tooltip
                placement="left"
                title={
                  occupied
                    ? 'Clique para desocupar a mesa'
                    : 'Clique para ocupar mesa'
                }
              >
                <div
                  onClick={handleTableOccupied(uuid, occupied)}
                  role="button"
                  tabIndex={0}
                  className={styles.tableInfo}
                >
                  <p>
                    A mesa contém{' '}
                    <span className={styles.bold}>
                      {`${seats} ${pluralize(seats, 'assento', 'assentos')}`}
                    </span>
                  </p>
                  <p>
                    A mesa{' '}
                    <span className={styles.bold}>
                      {occupied ? 'está' : 'não está'}
                    </span>{' '}
                    ocupada
                  </p>
                </div>
              </Tooltip>

              <div className={styles.tableItems}>
                <p
                  className={styles.tableNumber}
                  style={{
                    fontSize: '1.5rem',
                    color: occupied ? '#e74c3c' : '#2ecc71',
                  }}
                >
                  {number}
                </p>

                <TableIcon
                  style={{
                    fontSize: 80,
                    color: occupied ? '#e74c3c' : '#2ecc71',
                  }}
                />

                <div className={styles.tableActions}>
                  <Tooltip title="Editar mesa">
                    <Button
                      onClick={selectTable(uuid)}
                      shape="round"
                      icon={<EditOutlined />}
                    />
                  </Tooltip>

                  <Tooltip title="Remover mesa">
                    <Button
                      shape="round"
                      onClick={handleRemoveTable(uuid)}
                      loading={removeTableLoading}
                      icon={<DeleteOutlined />}
                      style={{ color: '#e74c3c' }}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </animated.li>
        ))}
      </ul>

      <div className={styles.paginationContainer}>
        <Pagination
          pageSize={pagination.size}
          current={pagination.page + 1}
          total={data.totalElements}
          hideOnSinglePage
          onChange={handlePaginationChange}
          responsive
          showSizeChanger={false}
        />
      </div>

      <div className={styles.bottomButton}>
        <Tooltip title="Adicionar mesa" placement="left">
          <Button
            style={{ minWidth: 50, minHeight: 50 }}
            shape="circle"
            type="primary"
            onClick={showPersistTable}
            icon={<PlusOutlined style={{ fontSize: 25 }} />}
          />
        </Tooltip>
      </div>

      <PersistTable
        title={selectedTable ? 'Atualizar mesa' : 'Criar mesa'}
        seats={selectedTable?.seats}
        number={selectedTable?.number}
        loading={persistTableLoading}
        visible={persistTableShow}
        onFinish={selectedTable ? updateSelectedTable : handleCreateTable}
        onCancel={closePersistTable}
      />

      <Drawer
        width={drawerWidth}
        title="Pesquisar bebida"
        placement="right"
        onClose={closeDrawer}
        visible={drawerVisible}
      >
        <Form
          form={form}
          onFinish={handleFormFinish}
          layout="vertical"
          style={{ flex: 1 }}
          initialValues={{
            occupied: '-1',
            seats: [1, 10],
          }}
          name="search-tables"
          autoComplete="off"
        >
          <Divider orientation="left">Geral</Divider>

          <Form.Item label="Ocupação da mesa" name="occupied">
            <Select>
              <Option value="0">Não ocupada</Option>
              <Option value="1">Ocupada</Option>
              <Option value="-1">Ambos</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Assentos" name="seats">
            <Slider
              range={{ draggableTrack: true }}
              min={1}
              max={50}
              tipFormatter={(value) =>
                `${value} ${pluralize(value || 1, 'assento', 'assentos')}`
              }
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              span: 24,
              offset: 0,
            }}
          >
            <Button
              icon={<SearchOutlined />}
              size="large"
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              Pesquisar
            </Button>
          </Form.Item>

          <Form.Item
            wrapperCol={{
              span: 24,
              offset: 0,
            }}
          >
            <Button
              icon={<DeleteOutlined />}
              size="large"
              style={{ width: '100%' }}
              onClick={clearForm}
            >
              Limpar
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  );
}
