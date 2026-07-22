import React, { useState, useCallback } from "react";
import {
  Stack,
  HeaderLink,
  Icon,
  IconButton,
  getTheme,
  Routes,
  Route,
  getStyle
} from "./lib";
import { AppNavBar } from "./AppNavBar";
import { NavBar } from "./NavBar";
import { IApplication } from "../../lib/queries";

interface Props {
  my: any;
  Brand?: React.FC<any>;
  Controls?: React.FC<any>;
  ExternalApps?: React.FC<any>;
}

export const Header: React.FC<Props> = ({
  my,
  Brand,
  Controls,
  ExternalApps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getTheme();
  const style = getStyle();
  const openPanel = useCallback(() => setIsOpen(true), []);
  const dismissPanel = useCallback(() => setIsOpen(false), []);
  return (
    <div
      style={{
        backgroundColor: theme.semanticColors.primaryButtonBackgroundHovered,
        color: theme.palette.themeLighter,
        width: "100vw",
      }}
      >
      <Stack
        horizontal
        horizontalAlign={"space-between"}
        verticalAlign={"center"}
        tokens={{ childrenGap: "0.77em", maxHeight: "3.85em" }}
        style={{      
          backgroundColor: theme.semanticColors.primaryButtonBackground,
          color: theme.palette.themeLighter,
          position: "fixed",
          width: "100vw",
          minWidth: "24.64em",
          zIndex: 1000
        }}
      >
        <Stack
          verticalAlign={"center"}
          horizontal
          tokens={{ childrenGap: "0.77em" }}
        >
          <IconButton onClick={openPanel} className={style.headerIconButton}>
            <Icon iconName={"Waffle"} className={style.waffle} />
          </IconButton>

          {Brand && (
            <Brand
              style={{
                fill: theme.palette.themeLighter,
                height: "2.695em",
                minHeight: "2.695em",
                maxHeight: "2.695em",
                width: "2.695em"
              }}
            />
          )}
          <Routes>
            <Route
              path={`/*`}
              // exact
              element={
                <HeaderLink to={`/`}>
                  Home
                </HeaderLink>
              }
            />
            {my?.applications &&
              my.applications.map((app: IApplication) => (
                <Route
                  key={app.path}
                  path={`/${app.path}/*`}
                  element={
                    <HeaderLink to={`/${app.path}`}>
                      {app.name}
                    </HeaderLink>
                  }
                />
              ))}
          </Routes>
        </Stack>
        <AppNavBar
          isOpen={isOpen}
          dismissPanel={dismissPanel}
          my={my}
          ExternalApps={ExternalApps}
        />
        <NavBar my={my} Controls={Controls} className={style.navBar} />
      </Stack>
    </div>
  );
};
