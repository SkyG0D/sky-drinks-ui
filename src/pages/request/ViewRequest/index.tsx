import { useCallback, useContext, useEffect, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Modal } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import endpoints from 'src/api/api';
import routes from 'src/routes';
import { LoadingIndicator } from 'src/components/other/LoadingIndicator';
import { QRCodeGenerator } from 'src/components/other/QRCodeGenerator';
import { AuthContext } from 'src/contexts/AuthContext';
import { WebSocketContext } from 'src/contexts/WebSocketContext';
import { useTitle } from 'src/hooks/useTitle';
import { formatDisplayPrice } from 'src/utils/formatDisplayPrice';
import { getStatusBadge } from 'src/utils/getStatusBadge';
import { getUserPermissions } from 'src/utils/getUserPermissions';
import { handleError } from 'src/utils/handleError';
import { isUUID } from 'src/utils/isUUID';
import { showNotification } from 'src/utils/showNotification';

import { DrinkList } from './DrinkList';
import { DateTimeElapsed } from './DateTimeElapsed';

import styles from './styles.module.scss';

interface UpdatedRequest {
  status?: RequestStatusType;
  delivered?: boolean;
}

const { confirm } = Modal;

export function ViewRequest(): JSX.Element {
  useTitle('SkyDrinks - Visualizar pedido');

  const { userInfo } = useContext(AuthContext);
  const { updateRequest: updateRequestView } = useContext(WebSocketContext);

  const params = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requestFound, setRequestFound] = useState<RequestType>(
    {} as RequestType
  );

  const redirect = useCallback(() => {
    const path = location?.state?.path
      ? `/${location?.state?.path}`
      : routes.HOME;

    navigate(path);
  }, [location, navigate]);

  useEffect(() => {
    const uuid = params.uuid || '';

    async function loadRequest(): Promise<void> {
      if (isUUID(uuid)) {
        try {
          const request = await endpoints.findRequestByUUID(uuid);
          setRequestFound(request);
        } catch (error: any) {
          handleError({
            error,
            fallback: 'N??o foi poss??vel carregar o pedido',
          });

          redirect();
        } finally {
          setLoading(false);
        }
      } else {
        showNotification({
          type: 'warn',
          message: 'Pesquise por um c??digo v??lido!',
        });

        redirect();
      }
    }

    if (loading) {
      loadRequest();
    }

    return () => setLoading(false);
  }, [params, loading, navigate, location, redirect]);

  useEffect(() => {
    if (updateRequestView) {
      setLoading(true);
    }
  }, [updateRequestView]);

  function updateRequest(request: UpdatedRequest): void {
    setRequestFound({ ...requestFound, ...request });
  }

  function handleCancelRequest(): void {
    async function cancelRequest(): Promise<void> {
      try {
        await endpoints.cancelRequest(requestFound.uuid);

        updateRequest({ status: 'CANCELED' });

        showNotification({
          type: 'success',
          message: 'Pedido foi cancelado com sucesso!',
        });
      } catch (error: any) {
        handleError({
          error,
          fallback: 'N??o foi poss??vel cancelar o pedido',
        });
      }
    }

    confirm({
      title: 'Deseja cancelar o pedido?',
      content: 'Depois de cancelado, o pedido n??o poder?? ser finalizado!',
      okText: 'Sim',
      cancelText: 'N??o',
      onOk: cancelRequest,
    });
  }

  function handleStartRequest(): void {
    async function startRequest(): Promise<void> {
      try {
        await endpoints.startRequest(requestFound.uuid);

        updateRequest({ status: 'STARTED' });

        showNotification({
          type: 'success',
          message: 'Pedido foi iniciado com sucesso!',
        });
      } catch (error: any) {
        handleError({
          error,
          fallback: 'N??o foi poss??vel iniciar o pedido',
        });
      }
    }

    confirm({
      title: 'Deseja iniciar o pedido?',
      okText: 'Sim',
      cancelText: 'N??o',
      onOk: startRequest,
    });
  }

  function handleFinishRequest(): void {
    async function finishRequest(): Promise<void> {
      try {
        await endpoints.finishRequest(requestFound.uuid);

        updateRequest({ status: 'FINISHED' });

        showNotification({
          type: 'success',
          message: 'Pedido foi finalizado com sucesso!',
        });
      } catch (error: any) {
        handleError({
          error,
          fallback: 'N??o foi poss??vel finalizar o pedido',
        });
      }
    }

    confirm({
      title: 'Deseja finlizar o pedido?',
      okText: 'Sim',
      cancelText: 'N??o',
      onOk: finishRequest,
    });
  }

  function handleDeliverRequest(): void {
    async function deliverRequest(): Promise<void> {
      try {
        await endpoints.deliverRequest(requestFound.uuid);

        updateRequest({ status: 'FINISHED', delivered: true });

        showNotification({
          type: 'success',
          message: 'Pedido foi entregue com sucesso!',
        });
      } catch (error: any) {
        handleError({
          error,
          fallback: 'N??o foi poss??vel entregar o pedido',
        });
      }
    }

    confirm({
      title: 'Deseja entregar o pedido?',
      content: 'Depois de entregado, o pedido n??o poder?? ser cancelado!',
      okText: 'Sim',
      cancelText: 'N??o',
      onOk: deliverRequest,
    });
  }

  const permissions = getUserPermissions(userInfo.role);

  function showActions(): JSX.Element {
    const { isBarmen, isWaiter } = permissions;

    const isStaff = isBarmen || isWaiter;
    const isRequestOwner = userInfo.uuid === requestFound.user?.uuid;

    const hasPermission =
      isStaff || (isRequestOwner && requestFound.status === 'PROCESSING');

    const ownerCannotCancel =
      isRequestOwner && requestFound.status === 'FINISHED' && !isStaff;

    const invalidFlags =
      requestFound.status === 'CANCELED' ||
      !hasPermission ||
      ownerCannotCancel ||
      requestFound.delivered;

    if (invalidFlags) {
      return <div />;
    }

    return (
      <>
        <Divider
          style={{ fontSize: '1.5rem', margin: '2rem 0' }}
          orientation="left"
        >
          A????es
        </Divider>

        <div className={styles.actions}>
          {isStaff &&
            requestFound.status === 'FINISHED' &&
            !requestFound.delivered && (
              <Button
                onClick={handleDeliverRequest}
                shape="round"
                size="large"
                icon={<CheckOutlined style={{ color: '#2ecc71' }} />}
              >
                Entregar pedido
              </Button>
            )}

          {isStaff && requestFound.status === 'PROCESSING' && (
            <Button
              onClick={handleStartRequest}
              shape="round"
              size="large"
              icon={<CheckOutlined style={{ color: '#2ecc71' }} />}
            >
              Iniciar pedido
            </Button>
          )}

          {isStaff && requestFound.status === 'STARTED' && (
            <Button
              onClick={handleFinishRequest}
              shape="round"
              size="large"
              icon={<CheckOutlined style={{ color: '#2ecc71' }} />}
            >
              Finalizar pedido
            </Button>
          )}

          {hasPermission && (
            <Button
              onClick={handleCancelRequest}
              shape="round"
              size="large"
              icon={<CloseOutlined style={{ color: '#e74c3c' }} />}
            >
              Cancelar pedido
            </Button>
          )}
        </div>
      </>
    );
  }

  const showQRCode =
    requestFound.status === 'FINISHED' &&
    !requestFound.delivered &&
    userInfo.uuid === requestFound.user?.uuid;

  return (
    <section className={styles.container}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        <>
          <div>
            <h2 className={styles.title}>Visualizar Pedido</h2>
          </div>

          <div>
            {showQRCode && (
              <div className={styles.qrcode}>
                <p className={styles.qrcodeTitle}>QRCode do pedido:</p>

                <QRCodeGenerator text={window.location.href} />

                <p className={styles.warnMessage}>
                  Cuidado! Apenas compartilhe o QRCode do pedido com pessoas que
                  voc?? confia. Isso ?? o que garante para nossos funcion??rios que
                  quem o possu?? tem autoriza????o para receber o pedido.
                </p>
              </div>
            )}

            {showActions()}

            <Divider
              style={{ fontSize: '1.5rem', margin: '2rem 0' }}
              orientation="left"
            >
              Geral
            </Divider>

            <h3>
              C??digo do pedido:{' '}
              <span className={styles.bold}>{requestFound.uuid}</span>
            </h3>

            <p>
              Usu??rio:{' '}
              <span className={styles.bold}>
                {requestFound.user?.name} - {requestFound.user?.email}
              </span>
            </p>

            <div className={styles.status}>
              <p>Status: </p>
              {getStatusBadge(requestFound.status)}
            </div>

            {requestFound.status === 'FINISHED' && !requestFound.delivered && (
              <p className={styles.warnMessage}>
                {requestFound.table
                  ? `Seu pedido ser?? entregue na mesa n?? ${requestFound.table?.number}!`
                  : 'V?? pegar seu pedido no balc??o.'}
              </p>
            )}

            {requestFound.status === 'CANCELED' && (
              <p className={styles.warnMessage}>
                V?? at?? o balc??o para mais informa????es sobre o cancelamento.
              </p>
            )}

            {requestFound.status === 'FINISHED' && requestFound.delivered && (
              <p className={styles.warnMessage}>O pedido j?? foi entregado.</p>
            )}

            {requestFound.createdAt && (
              <DateTimeElapsed
                start={new Date(requestFound.createdAt)}
                initalTimeText="quase agora"
                prefix="Pedido realizado"
              />
            )}

            {requestFound.updatedAt && (
              <DateTimeElapsed
                start={new Date(requestFound.updatedAt)}
                initalTimeText="quase agora"
                prefix="Pedido atualizado"
              />
            )}

            <p>
              Pre??o estimado:{' '}
              <span className={styles.bold}>
                {formatDisplayPrice(requestFound.totalPrice)}
              </span>
            </p>

            <DrinkList request={requestFound} />
          </div>
        </>
      )}
    </section>
  );
}
