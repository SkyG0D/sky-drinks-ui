import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Empty, Modal, Pagination, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import endpoints, { toFullPictureURI } from "src/api/api";
import { useTitle } from "src/hooks/useTitle";
import routes from "src/routes";
import { formatDisplayPrice } from "src/utils/formatDisplayPrice";
import { pluralize } from "src/utils/pluralize";
import { showNotification } from "src/utils/showNotification";
import styles from "./styles.module.scss";

type DrinkType = {
  uuid: string;
  volume: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  picture: string;
  description: string;
  price: number;
  additional: string;
  additionalList: string[];
  alcoholic: boolean;
};

type UserType = {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  role: string;
  birthDay: string;
  cpf: string;
};

type StatusType = "PROCESSING" | "FINISHED" | "CANCELED";

type RequestType = {
  drinks: DrinkType[];
  createdAt: string;
  updatedAt: string;
  status: StatusType;
  uuid: string;
  user: UserType;
  totalPrice: number;
};

type PaginetedDataType = {
  totalElements: number;
  content: RequestType[];
};

const { confirm } = Modal;

export function ManageRequest() {
  useTitle("SkyDrinks - Gerenciar pedidos");

  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
  });

  const [data, setData] = useState<PaginetedDataType>({
    totalElements: 0,
    content: [],
  });

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await endpoints.getProcessingRequests(
          pagination.page,
          pagination.size
        );

        setData(data);
      } catch (e: any) {
        showNotification({
          type: "warn",
          message: e.message,
        });
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      loadRequests();
    }
  }, [loading, pagination]);

  function removeRequestOfState(uuid: string) {
    const content = data.content.filter((item) => item.uuid !== uuid);

    if (content.length > 0) {
      setData({ ...data, content });
    } else if (pagination.page > 0) {
      setPagination({ ...pagination, page: pagination.page - 1 });
      setLoading(true);
    }
  }

  function handleCancelRequest(uuid: string) {
    async function cancelRequest() {
      try {
        await endpoints.cancelRequest(uuid);

        removeRequestOfState(uuid);

        showNotification({
          type: "success",
          message: "Pedido foi cancelado com sucesso!",
        });
      } catch (e: any) {
        showNotification({
          type: "warn",
          message: e.message,
        });
      }
    }

    return () => {
      confirm({
        title: "Deseja cancelar o pedido?",
        content: "Depois de cancelado, o pedido não poderá ser finalizado!",
        okText: "Sim",
        cancelText: "Não",
        onOk: cancelRequest,
      });
    };
  }

  function handlePaginationChange(page: number) {
    setPagination((pagination) => {
      return { ...pagination, page: page - 1 };
    });

    setLoading(true);
  }

  function handleFinishRequest(uuid: string) {
    async function finishRequest() {
      try {
        await endpoints.finishRequest(uuid);

        removeRequestOfState(uuid);

        showNotification({
          type: "success",
          message: "Pedido foi finalizado com sucesso!",
        });
      } catch (e: any) {
        showNotification({
          type: "warn",
          message: e.message,
        });
      }
    }

    return () => {
      confirm({
        title: "Deseja finlizar o pedido?",
        content: "Depois de finalizado, o pedido não poderá ser cancelado!",
        okText: "Sim",
        cancelText: "Não",
        onOk: finishRequest,
      });
    };
  }

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Gerenciar Pedidos</h2>
      </div>

      {Boolean(data.content.length) ? (
        <>
          <ul className={styles.cardContainer}>
            {data.content.map(({ uuid, user, totalPrice, drinks }) => {
              const drinksSize = drinks.length;
              const { picture } = toFullPictureURI(drinks[0]);

              return (
                <li key={uuid}>
                  <div className={styles.card}>
                    <div className={styles.cardContent}>
                      <Link
                        to={`/${routes.VIEW_REQUEST.replace(":uuid", uuid)}`}
                      >
                        <figure className={styles.cardFigure}>
                          <img alt={`Request de id ${uuid}`} src={picture} />
                        </figure>
                      </Link>

                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardTitle}>
                          Preço: {formatDisplayPrice(totalPrice)}
                        </h3>

                        <p className={styles.cardText}>Usuário: {user.name}</p>

                        <p className={styles.cardText}>
                          {`${drinksSize} ${pluralize(
                            drinksSize,
                            "bebida",
                            "bebidas"
                          )}`}
                        </p>

                        <div className={styles.cardActions}>
                          <Tooltip title="Finalizar pedido">
                            <Button
                              onClick={handleFinishRequest(uuid)}
                              shape="round"
                              icon={
                                <CheckOutlined style={{ color: "#2ecc71" }} />
                              }
                            />
                          </Tooltip>

                          <Tooltip title="Cancelar pedido">
                            <Button
                              onClick={handleCancelRequest(uuid)}
                              shape="round"
                              icon={
                                <CloseOutlined style={{ color: "#e74c3c" }} />
                              }
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className={styles.paginationContainer}>
              <Pagination
                defaultPageSize={pagination.size}
                current={pagination.page + 1}
                total={data.totalElements}
                hideOnSinglePage
                onChange={handlePaginationChange}
              />
            </div>
        </>
      ) : (
        <Empty description="Nenhum pedido para gerenciar" />
      )}
    </div>
  );
}
