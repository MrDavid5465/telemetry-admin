import React from 'react';
import { Stack, getTheme } from '@fluentui/react';

interface ThumbnailCardProps {
  width?: number;
  thumbnailHeight?: number;
  // Rendered before the truncated title text, e.g. a colored type badge.
  titlePrefix?: React.ReactNode;
  title: string;
  // Header-right content, typically a row of IconButtons.
  actions?: React.ReactNode;
  // Convenience: renders a cover-fit background image. Ignored if children is set.
  thumbnailUrl?: string;
  // Background shown behind children / the placeholder, when thumbnailUrl isn't set.
  emptyBackground?: string;
  // Centered content shown when there's neither a thumbnailUrl nor children.
  placeholder?: React.ReactNode;
  onThumbnailClick?: () => void;
  // Custom thumbnail content (e.g. a live canvas preview) — takes priority over thumbnailUrl.
  children?: React.ReactNode;
}

// Shared card shell for the "box, header row with title + actions, thumbnail
// area below" pattern repeated across dashboard/car/template cards.
// Consolidating it means a fix or restyle here reaches every card that uses
// it, instead of drifting out of sync between copies.
const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  width = 280,
  thumbnailHeight = 175,
  titlePrefix,
  title,
  actions,
  thumbnailUrl,
  emptyBackground,
  placeholder,
  onThumbnailClick,
  children,
}) => {
  const theme = getTheme();
  const hasContent = !!children || !!thumbnailUrl;

  return (
    <Stack
      style={{
        width,
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        style={{ padding: '0.5em 0.75em' }}
      >
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 7 }} style={{ minWidth: 0, flex: 1 }}>
          {titlePrefix}
          <span
            style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={title}
          >
            {title}
          </span>
        </Stack>
        {actions && (
          <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
            {actions}
          </Stack>
        )}
      </Stack>

      <div
        onClick={onThumbnailClick}
        style={{
          width: '100%',
          height: thumbnailHeight,
          position: 'relative',
          overflow: 'hidden',
          background: thumbnailUrl
            ? `url(${thumbnailUrl}) center/cover`
            : (emptyBackground ?? theme.palette.neutralLighter),
          cursor: onThumbnailClick ? 'pointer' : undefined,
          display: hasContent ? undefined : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
        {!hasContent && placeholder && (
          <span style={{ opacity: 0.5, fontSize: '0.85em' }}>{placeholder}</span>
        )}
      </div>
    </Stack>
  );
};

export default ThumbnailCard;
