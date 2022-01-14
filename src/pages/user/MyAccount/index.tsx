import { useContext } from "react";
import { Link } from "react-router-dom";
import { Avatar, Divider, Switch, Tooltip } from "antd";

import routes from "src/routes";
import { useTitle } from "src/hooks/useTitle";
import { AuthContext } from "src/contexts/AuthContext";
import { formatDisplayRole } from "src/utils/formatDisplayRole";
import { EditOutlined } from "@ant-design/icons";
import { formatDisplayDate } from "src/utils/formatDatabaseDate";
import { getUserAge } from "src/utils/getUserAge";
import { BrowserPermissionsContext } from "src/contexts/BrowserPermissionsContext";
import { getUserPermissions } from "src/utils/getUserPermissions";

import { Statistics } from "./statistics";

import styles from "./styles.module.scss";
import avatar from "src/assets/avatar_white.png";

export function MyAccount() {
  useTitle("SkyDrinks - Minha Conta");

  const { userInfo } = useContext(AuthContext);

  const {
    notificationPermission,
    requestNotificationPermission,
    soundPermission,
    toggleSoundPermission,
  } = useContext(BrowserPermissionsContext);

  const permissions = getUserPermissions(userInfo.role);

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.myAccount}>
          <div className={styles.avatarWrapper}>
            <Avatar className={styles.avatar} src={avatar} />
          </div>

          <h2 className={styles.title}>Minha Conta</h2>
          <h3 title={userInfo.name} className={styles.name}>
            {userInfo.name}
          </h3>

          <p title={userInfo.email} className={styles.email}>
            {userInfo.email}
          </p>

          <Tooltip title="Editar informações" className={styles.edit}>
            <Link
              state={{ back: routes.MY_ACCOUNT }}
              to={routes.EDIT_USER.replace(":uuid", userInfo.uuid)}
            >
              <EditOutlined style={{ fontSize: "1.5rem" }} />
            </Link>
          </Tooltip>
        </div>

        <div className={styles.divider}>
          <Divider style={{ fontSize: "1.5rem" }} orientation="left">
            Informações
          </Divider>
        </div>

        <div className={styles.info}>
          <p>
            Email: <span className={styles.bold}>{userInfo.email}</span>
          </p>
          <p>
            CPF: <span className={styles.bold}>{userInfo.cpf}</span>
          </p>
          <p>
            Tipo:{" "}
            <span className={styles.bold}>
              {formatDisplayRole(userInfo.role)}
            </span>
          </p>
          <p>
            Idade:{" "}
            <span className={styles.bold}>
              {getUserAge(userInfo.birthDay)} Anos
            </span>
          </p>
          <p>
            Sua conta foi criada em:{" "}
            <span className={styles.bold}>
              {formatDisplayDate(userInfo.createdAt)}
            </span>
          </p>
          <p>
            Última atualização:{" "}
            <span className={styles.bold}>
              {formatDisplayDate(userInfo.updatedAt)}
            </span>
          </p>
        </div>
      </div>

      {permissions.isUser && <Statistics />}

      <div>
        <Divider orientation="left" style={{ fontSize: "1.5rem" }}>
          Permissões
        </Divider>

        <div className={styles.perm}>
          <p>Permitir sons:</p>
          <Switch checked={soundPermission} onClick={toggleSoundPermission} />
        </div>

        <div className={styles.perm}>
          <p>Permitir notificações:</p>
          <Switch
            checked={notificationPermission === "granted"}
            onClick={requestNotificationPermission}
          />
        </div>
      </div>
    </div>
  );
}