import { Badge, Divider, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import endpoints, { toFullPictureURI } from "src/api/api";
import { useTitle } from "src/hooks/useTitle";
import routes from "src/routes";
import { formatDisplayDate } from "src/utils/formatDatabaseDate";
import { formatDisplayPrice } from "src/utils/formatDisplayPrice";
import { getDrinksGroupedByUUID } from "src/utils/getDrinksGroupedByUUID";
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

type Table = {};

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

type RequestType = {
  drinks: DrinkType[];
  createdAt: string;
  updatedAt: string;
  uuid: string;
  user: UserType;
  table?: Table;
};

export function ViewRequest() {
  useTitle("SkyDrinks - Visualizar pedido");

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requestFound, setRequestFound] = useState<RequestType>(
    {} as RequestType
  );

  const redirect = useCallback(() => {
    const path = location?.state?.path
      ? `/${location.state.path}`
      : routes.HOME;

    navigate(path);
  }, [location, navigate]);

  useEffect(() => {
    async function loadRequest() {
      try {
        const request = await endpoints.findRequestByUUID(params.uuid || "");
        setRequestFound(request);
      } catch (e: any) {
        showNotification({
          type: "warn",
          message: e.message,
        });

        redirect();
      } finally {
        setLoading(false);
      }
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(params.uuid || "");

    if (!isUUID) {
      showNotification({
        type: "warn",
        message: "Pesquise por um código válido!",
      });

      redirect();
    }

    if (loading && isUUID) {
      loadRequest();
    }

    return () => setLoading(false);
  }, [params, loading, navigate, location, redirect]);

  return (
    <div className={styles.container}>
      {loading ? (
        <Spin />
      ) : (
        <>
          <div>
            <h2 className={styles.title}>Visualizar Pedido</h2>
          </div>

          <div>
            <h3>Código do pedido: {requestFound.uuid}</h3>
            <p>
              Pedido realizado em {formatDisplayDate(requestFound.createdAt)}
            </p>
            <p>
              Pedido atualizado em {formatDisplayDate(requestFound.updatedAt)}
            </p>

            <Divider orientation="left">Bebidas</Divider>

            <div>
              {Object.keys(getDrinksGroupedByUUID(requestFound)).map(
                (key, index) => {
                  const drinksWithFullPicture =
                    requestFound.drinks.map(toFullPictureURI);
                  const drinksGrouped = getDrinksGroupedByUUID({
                    drinks: drinksWithFullPicture,
                  });
                  const [drink] = drinksGrouped[key];
                  const length = drinksGrouped[key].length;

                  const { picture, name, price } = drink;

                  return (
                    <div
                      title={name}
                      key={`${key} - ${index}`}
                      className={styles.drink}
                    >
                      <div className={styles.info}>
                        <Link to={routes.VIEW_DRINK.replace(":uuid", key)}>
                          <p className={styles.name}>{name}</p>
                        </Link>
                        <p className={styles.price}>
                          R$ {formatDisplayPrice(price * length)}
                        </p>
                      </div>

                      <Badge count={length}>
                        <figure>
                          <img src={picture} alt={name} />
                        </figure>
                      </Badge>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
