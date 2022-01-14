import {
  DeleteOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Badge, Button, Image, List, Modal, Popover, Upload } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import endpoints from "src/api/api";
import { DrinkIcon } from "src/components/custom/CustomIcons";
import { useTitle } from "src/hooks/useTitle";
import routes from "src/routes";
import { DrinkType } from "src/types/drinks";
import { handleError } from "src/utils/handleError";
import { imageToFullURI } from "src/utils/imageUtils";
import { showNotification } from "src/utils/showNotification";

import styles from "./styles.module.scss";

interface ImageFoundedType {
  image: string;
  drinks: DrinkType[];
}

interface PaginetedDataType {
  totalElements: number;
  content: ImageFoundedType[];
}

const { confirm } = Modal;

export function ListImages() {
  useTitle("SkyDrinks - Visualizar imagens");

  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
  });

  const [data, setData] = useState<PaginetedDataType>({
    totalElements: 0,
    content: [],
  });

  const [showUploadList, setShowUploadList] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesUploading, setImagesUploading] = useState(false);

  useEffect(() => {
    async function loadImages() {
      try {
        const data = await endpoints.getAllImages(
          pagination.page,
          pagination.size
        );

        setData(data);
      } catch (error: any) {
        handleError({
          error,
          fallback: "Não foi possível carregar as imagens das bebidas",
        });
      } finally {
        setLoading(false);
      }
    }

    if (loading) {
      loadImages();
    }
  }, [loading, pagination]);

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  function deleteImage(image: string) {
    const remove = async () => {
      try {
        setLoadingDelete(true);

        await endpoints.deleteImage(image);

        const isLastElementOfPage =
          data.content.length === 1 && pagination.page > 0;

        setData({
          ...data,
          content: data.content.filter((item) => item.image !== image),
        });

        if (isLastElementOfPage) {
          setPagination({
            ...pagination,
            page: pagination.page - 1,
          });

          setLoading(true);
        }

        showNotification({
          type: "success",
          message: "Imagem foi removida com sucesso!",
        });
      } catch (error: any) {
        handleError({
          error,
          fallback: "Não foi possível encontrar as imagens",
        });
      } finally {
        setLoadingDelete(false);
      }
    };

    return () => {
      confirm({
        type: "success",
        title: "Realmente deseja remover essa imagem?",
        okText: "Sim",
        cancelText: "Não",
        onOk: remove,
      });
    };
  }

  function getDrinksContent(drinks: DrinkType[]) {
    return drinks.map(({ uuid, name }) => (
      <Link key={uuid} to={routes.VIEW_DRINK.replace(":uuid", uuid)}>
        <p className={styles.drinkName}>{name}</p>
      </Link>
    ));
  }

  function handlePaginationChange(page: number) {
    setLoading(true);

    setPagination((pagination) => {
      return { ...pagination, page: page - 1 };
    });
  }

  function dummyRequest({ file, onSuccess }: any) {
    setImages([...images, file]);
    setShowUploadList(true);

    return onSuccess(file);
  }

  async function uploadImages() {
    try {
      setImagesUploading(true);

      await endpoints.uploadMultipleImages(images);

      setShowUploadList(false);

      showNotification({
        type: "success",
        message: "Upload realizado com sucesso!",
      });
    } catch {
      showNotification({
        type: "warn",
        message: "Não foi possível realizar o upload",
      });
    } finally {
      setImagesUploading(false);
    }
  }

  function resetImages() {
    setShowUploadList(false);
    setImages([]);
  }

  const popoverTrigger = window.innerWidth > 700 ? "hover" : "click";

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Imagens</h2>
      </div>

      <div className={styles.uploadImages}>
        {Boolean(images.length) && (
          <>
            <Button
              loading={imagesUploading}
              size="large"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={uploadImages}
            >
              Iniciar Upload
            </Button>

            <Button
              loading={imagesUploading}
              size="large"
              type="primary"
              style={{
                color: "#ffffff",
                borderColor: "#e74c3c",
                backgroundColor: "#e74c3c",
              }}
              icon={<PlayCircleOutlined />}
              onClick={resetImages}
            >
              Resetar Imagens
            </Button>
          </>
        )}

        <Upload
          listType="picture"
          accept="image/png, image/jpeg"
          multiple
          customRequest={dummyRequest}
          showUploadList={showUploadList}
        >
          <Button
            loading={imagesUploading}
            size="large"
            icon={<UploadOutlined />}
          >
            Upar Imagens
          </Button>
        </Upload>
      </div>

      <div>
        <List
          loading={loading}
          pagination={{
            current: pagination.page + 1,
            pageSize: pagination.size,
            onChange: handlePaginationChange,
            total: data.totalElements,
            hideOnSinglePage: true,
            responsive: true,
            showSizeChanger: false,
          }}
          dataSource={data.content}
          renderItem={({ drinks, image }) => {
            const picture = imageToFullURI(image);

            const actions = [
              ...(drinks.length > 0
                ? [
                    <Popover
                      key="drinks"
                      trigger={popoverTrigger}
                      title="Bebidas"
                      content={getDrinksContent(drinks)}
                    >
                      <Button shape="round" icon={<DrinkIcon />} />
                    </Popover>,
                  ]
                : []),

              <Button
                key="remove"
                shape="round"
                loading={loadingDelete}
                icon={<DeleteOutlined style={{ color: "#e74c3c" }} />}
                onClick={deleteImage(image)}
              />,
            ];

            return (
              <List.Item actions={actions} className={styles.item}>
                <Image
                  src={picture}
                  alt={image}
                  style={{ minWidth: 100 }}
                  width={100}
                  height={100}
                />
                <div className={styles.info}>
                  <List.Item.Meta
                    title={<p className={styles.imageName}>{image}</p>}
                  />
                  <div className={styles.badge}>
                    {drinks.length > 0 ? (
                      <Badge
                        status="success"
                        text="Essa imagem possuí bebida!"
                      />
                    ) : (
                      <Badge
                        status="error"
                        text="Essa imagem não possuí bebida!"
                      />
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );
}
