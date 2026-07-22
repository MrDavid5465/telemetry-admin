/**
 * Pre-built dashboard `elements` payloads for canvas rendering tests.
 * Each component is placed to avoid overlap and uses only mandatory fields
 * (id, type, x, y, width, height); type-specific defaults apply at runtime.
 *
 * Sprite-based types reference 'test-sprite.svg', which is served as a blank
 * SVG by the mock-gql helper.
 */

const SPRITE_FILE = 'test-sprite.svg';

export const ALL_GAUGE_TYPES_ELEMENTS = JSON.stringify({
  v: 2,
  components: [
    // ── Freeform types ──────────────────────────────────────────────
    { id: 'tf-text',          type: 'text-gauge',           x: 0,   y: 0,   width: 200, height: 60  },
    { id: 'tf-arc',           type: 'arc-gauge-face',        x: 220, y: 0,   width: 200, height: 200 },
    { id: 'tf-arc-sprite',    type: 'sprite-arc-gauge-face', x: 440, y: 0,   width: 200, height: 200 },
    { id: 'tf-graph-bar',     type: 'graph-bar-gauge',       x: 660, y: 0,   width: 200, height: 150 },
    { id: 'tf-flag',          type: 'flag-display',          x: 0,   y: 220, width: 120, height: 50  },
    { id: 'tf-flag-sprite',   type: 'flag-display-sprite',   x: 140, y: 220, width: 120, height: 50  },
    { id: 'tf-button',        type: 'button-control',        x: 280, y: 220, width: 100, height: 50  },
    { id: 'tf-slider',        type: 'slider-control',        x: 400, y: 220, width: 160, height: 50  },
    { id: 'tf-encoder',       type: 'encoder-control',       x: 580, y: 220, width: 100, height: 100 },
    {
      id: 'tf-group', type: 'group', x: 700, y: 220, width: 250, height: 200,
      children: [
        { id: 'tf-group-text', type: 'text-gauge', x: 710, y: 230, width: 150, height: 50 },
      ],
    },

    // ── Sprite types ─────────────────────────────────────────────────
    { id: 'sp-static',       type: 'static-sprite',    x: 0,   y: 450, width: 120, height: 120, file: SPRITE_FILE },
    { id: 'sp-needle',       type: 'needle-gauge',     x: 140, y: 450, width: 120, height: 120, file: SPRITE_FILE },
    { id: 'sp-bar',          type: 'bar-gauge',        x: 280, y: 450, width: 80,  height: 160, file: SPRITE_FILE },
    { id: 'sp-sprite-bar',   type: 'sprite-bar-gauge', x: 380, y: 450, width: 80,  height: 160, file: SPRITE_FILE },
    { id: 'sp-sprite-text',  type: 'sprite-text-gauge', x: 480, y: 450, width: 180, height: 60, file: SPRITE_FILE },
    { id: 'sp-gif',          type: 'gif-gauge',        x: 680, y: 450, width: 120, height: 120, file: SPRITE_FILE },
  ],
});
