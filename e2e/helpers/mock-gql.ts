import { Page } from '@playwright/test';

// A single sprite returned by syncDashboardFiles — used for sprite-based gauge types.
const MOCK_SPRITE = {
  id: 'sprite-e2e-1',
  name: 'test-sprite',
  filepath: 'test-sprite.svg',
  fileType: 'svg',
  missing: false,
};

function makeRawDashboard(name: string, elements: string = JSON.stringify({ v: 2, components: [] })) {
  return {
    id: 'e2e-dashboard-1',
    name,
    baseDashType: 'freeform',
    path: '/e2e-test',
    canvasWidth: 1280,
    canvasHeight: 720,
    background: null,
    dayNight: false,
    neckFx: false,
    elements,
    kioskX: 1240,
    kioskY: 20,
    kioskOpacity: 0.15,
    thumbnailDay: null,
    thumbnailNight: null,
    groupIds: '[]',
  };
}

function gqlResponse(data: Record<string, unknown>) {
  return JSON.stringify({ data });
}

/**
 * Intercepts all GraphQL HTTP requests for the designer and returns canned
 * responses. Also serves blank SVGs for sprite asset requests so images
 * don't generate 404s.
 *
 * @param elements - Raw `elements` JSON string to embed in the dashboard row.
 *                   Defaults to an empty v2 component list.
 */
export async function mockGraphQL(
  page: Page,
  {
    dashboardName = 'E2E Test',
    elements,
  }: { dashboardName?: string; elements?: string } = {},
) {
  const rawDashboard = makeRawDashboard(dashboardName, elements);

  await page.route('**/typiql/graphql', async (route) => {
    let body: Record<string, unknown> = {};
    try {
      body = route.request().postDataJSON() as Record<string, unknown>;
    } catch {
      // body may be absent for WebSocket-style requests
    }

    const op = (body.operationName as string | undefined) ?? '';

    switch (op) {
      case 'my':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({
            my: {
              applications: [],
              settings: {
                launchPage: '/telemetry/default',
                theme: 'darkred',
                fontSize: 14,
                deviceMap: {},
                typiqlDataDir: null,
                steerMaxDeg: 400,
                setupComplete: true,
                telemetrySource: null,
                gamepadMappings: [],
              },
            },
          }),
        });
        break;

      case 'getDashboards':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({ getDashboards: [rawDashboard] }),
        });
        break;

      case 'getDashTemplates':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({ getDashTemplates: [] }),
        });
        break;

      case 'syncDashboardFiles':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({ syncDashboardFiles: [MOCK_SPRITE] }),
        });
        break;

      case 'heartbeatClient':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({
            heartbeatClient: { id: 'e2e', name: 'E2E', lastSeen: new Date().toISOString() },
          }),
        });
        break;

      case 'dashboardUpdates':
        // Subscription over HTTP multipart — respond with an immediately-closed
        // stream so Apollo sees a clean end-of-subscription rather than an error.
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'multipart/mixed; boundary="graphql"' },
          body: [
            '--graphql\r\n',
            'Content-Type: application/json\r\n\r\n',
            JSON.stringify({ hasNext: false, data: { dashboardUpdates: null } }),
            '\r\n--graphql--\r\n',
          ].join(''),
        });
        break;

      default:
        // Mutations (updateDashboard, etc.) — return empty success.
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: gqlResponse({}),
        });
    }
  });

  // Serve blank SVGs for all sprite thumbnail requests so images don't 404.
  const BLANK_SVG = '<svg xmlns="http://www.w3.org/2000/svg"/>';
  for (const pattern of ['**/dash-assets/**', '**/dash-sprites/**']) {
    await page.route(pattern, (route) =>
      route.fulfill({ status: 200, contentType: 'image/svg+xml', body: BLANK_SVG }),
    );
  }
}

/**
 * Navigate to the designer for a named dashboard and wait for it to finish
 * loading. Call mockGraphQL *before* this.
 */
export async function gotoDesigner(page: Page, dashboardName = 'E2E Test') {
  await page.goto(`/#/telemetry/manage/${encodeURIComponent(dashboardName)}`);
  await page.waitForSelector('text=Loading dashboard...', { state: 'hidden', timeout: 10_000 });
}
