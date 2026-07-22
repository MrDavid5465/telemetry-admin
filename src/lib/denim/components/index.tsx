import React from "react";
// import '../App.scss';
import "@fluentui/react";
import {
  Fabric,
  getStyle,
  loadTheme,
  Stack,
  Route,
  Routes,
  Navigate,
  useQuery
} from "../lib";
import { Header } from "./Header";
import Splashscreen from "./Splashscreen";
import { IMy } from "../lib/queries";
import dispatcher from "../lib/queries";
import IconSVG, { IconProps } from "../logo";

const THEME_CACHE_KEY = 'denim-theme';

function readThemeCache(): { theme: string; fontSize: number } | null {
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeThemeCache(settings: { theme?: string; fontSize?: number }) {
  try {
    if (settings.theme) {
      localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({
        theme: settings.theme,
        fontSize: settings.fontSize ?? 1,
      }));
    }
  } catch {}
}

export const setTheme = (theme: any, themes: any) => {
  const key = (theme && theme.theme) || "default";
  const build = themes[key] || themes.default;
  loadTheme(build(theme.fontSize || 1));
};

interface Props {
  components?: any;
  RootComponent?: any;
  themes: any;
  Logo?: React.FC<IconProps>;
  Brand?: React.FC<any>;
  Controls?: React.FC<any>;
  ExternalApps?: React.FC<any>;
}
const App: React.FC<Props> = ({
  components = {},
  themes,
  Logo = IconSVG,
  Brand,
  RootComponent,
  Controls,
  ExternalApps
}) => {
  const { loading, data } : { loading?: boolean, data?: IMy } = useQuery(dispatcher.my);
  if (loading || !data) {
    setTheme(readThemeCache() ?? { theme: "default", fontSize: 1 }, themes);
    return <Splashscreen Icon={Logo} />;
  }
  const settings = (data && data.my && data.my.settings) || {};
  writeThemeCache(settings);
  setTheme(settings || { theme: "default", fontSize: 1 }, themes);
  const style = getStyle();
  return (
    <Fabric
      key={`${data && data.my && data.my.settings && data.my.settings.theme}${
        data?.my?.settings?.fontSize
      }`}
      applyTo="body"
    >
      <Routes>
        <Route
          path={"kiosk/*"}
          element={
              <></>
            
          }
        />
        <Route
          path={"*"}
          element={
            <Header
              my={data && data.my}
              Brand={Brand}
              Controls={Controls}
              ExternalApps={ExternalApps}
            />
          }
        />
      </Routes>
      <Routes>
        <Route
          path={"*"}
          //exact
          element={
            <Stack className={style.content}>
              {RootComponent ? (
                <>
                  <RootComponent />
                </>
              ) : data &&
                data.my &&
                data.my.settings &&
                data.my.settings.launchPage ? (
                <Navigate to={`/${data.my.settings.launchPage}`} />
              ) : (
                <Stack>
                  <h1>Welcome, Click the waffle icon to begin!</h1>
                </Stack>
              )}
            </Stack>
          }
        />
        {data &&
          data.my &&
          data.my.applications &&
          data.my.applications.map((app, i) => {
            const Empty: React.FC = () => <Stack />;
            return (
              <Route
                key={i}
                path={`${app.path}/*`}
                element={
                    <Stack className={style.content}>
                      {app.defaultRoute && (
                        <Navigate to={`/${app.path}/${app.defaultRoute}`} />
                      )}
                      {React.createElement(components[app.frontEnd] || Empty, {
                        app
                      })}
                    </Stack>
                  
                }
              />
            );
          })}
        {data &&
          data.my &&
          data.my.applications &&
          data.my.applications.map((app, i) => {
            const Empty: React.FC = () => <Stack />;
            return (
              <Route
                key={i}
                path={`/kiosk/${app.path}`}
                element={
                    <Stack className={style.content} style={{ top: "0em" }}>
                      {app.defaultRoute && (                    
                        <Navigate
                          to={`/kiosk/${app.path}/${app.defaultRoute}`}
                        />
                      )}
                      {React.createElement(components[app.frontEnd] || Empty, {
                        app
                      })}
                    </Stack>
                }
              />
            );
          })}
      </Routes>
    </Fabric>
  );
};

export default App;
