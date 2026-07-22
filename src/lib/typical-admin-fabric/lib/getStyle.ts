import { IStyle, ITheme, FontWeights } from '@fluentui/react';

export interface Style {
  link: IStyle;
  modalHeader: IStyle;
  modalBody: IStyle;
  sm: IStyle;
  md: IStyle;
  lg: IStyle;
  xLg: IStyle;
  xxLg: IStyle;
  xxxLg: IStyle;
  hiddenSm: IStyle;
  hiddenMd: IStyle;
  hiddenMdDown: IStyle;
  hiddenMdUp: IStyle;
  hiddenLg: IStyle;
  hiddenLgDown: IStyle;
  hiddenLgUp: IStyle;
  hiddenXl: IStyle;
  hiddenXlDown: IStyle;
  hiddenXlUp: IStyle;
  hiddenXxl: IStyle;
  hiddenXxlDown: IStyle;
  hiddenXxlUp: IStyle;
  hiddenXxxl: IStyle;
}

const style = (theme: ITheme) =>
  ({
    sm: {
      width: '100%',
      selectors: {
        '@media (min-width: 36.883em)': {
          maxWidth: '36.883em',
        },
      },
    },
    md: {
      width: '100%',
      selectors: {
        '@media (min-width: 36.883em)': {
          maxWidth: '36.883em',
        },
        '@media (min-width: 49.203em)': {
          maxWidth: '49.203em',
        },
      },
    },
    lg: {
      width: '100%',
      selectors: {
        '@media (min-width: 36.883em)': {
          maxWidth: '36.883em',
        },
        '@media (min-width: 49.203em)': {
          maxWidth: '49.203em',
        },
        '@media (min-width: 78.771em)': {
          maxWidth: '78.771em',
        },
      },
    },
    xLg: {
      width: '100%',
      selectors: {
        '@media (min-width: 36.883em)': {
          maxWidth: '36.883em',
        },
        '@media (min-width: 49.203em)': {
          maxWidth: '49.203em',
        },
        '@media (min-width: 78.771em)': {
          maxWidth: '78.771em',
        },
        '@media (min-width: 105.105em)': {
          maxWidth: '105.105em',
        },
      },
    },
    xxLg: {
      width: '100%',
      selectors: {
        '@media (min-width: 36.883em)': {
          maxWidth: '36.883em',
        },
        '@media (min-width: 49.203em)': {
          maxWidth: '49.203em',
        },
        '@media (min-width: 78.771em)': {
          maxWidth: '78.771em',
        },
        '@media (min-width: 105.105em)': {
          maxWidth: '105.105em',
        },
      },
    },
    xxxLg: {
      width: '100%',
    },
    hiddenSm: {
      selectors: {
        '@media (max-width: 36.883em)': {
          display: 'none',
        },
      },
    },
    hiddenMd: {
      selectors: {
        '@media (min-width: 36.96em) and (max-width: 49.203em)': {
          display: 'none',
        },
      },
    },
    hiddenMdDown: {
      selectors: {
        '@media (max-width: 49.28em)': {
          display: 'none',
        },
      },
    },
    hiddenMdUp: {
      selectors: {
        '@media (min-width: 36.883em)': {
          display: 'none',
        },
      },
    },
    hiddenLg: {
      selectors: {
        '@media (min-width: 49.28em) and (max-width: 78.771em)': {
          display: 'none',
        },
      },
    },
    hiddenLgDown: {
      selectors: {
        '@media (max-width: 78.848em)': {
          display: 'none',
        },
      },
    },
    hiddenLgUp: {
      selectors: {
        '@media (min-width: 49.203em)': {
          display: 'none',
        },
      },
    },
    hiddenXl: {
      selectors: {
        '@media (min-width: 78.848em) and (max-width: 105.105em)': {
          display: 'none',
        },
      },
    },
    hiddenXlDown: {
      selectors: {
        '@media (max-width: 105.182em)': {
          display: 'none',
        },
      },
    },
    hiddenXlUp: {
      selectors: {
        '@media (min-width: 78.771em)': {
          display: 'none',
        },
      },
    },
    hiddenXxl: {
      selectors: {
        '@media (min-width: 105.182em) and (max-width: 147.763em)': {
          display: 'none',
        },
      },
    },
    hiddenXxlDown: {
      selectors: {
        '@media (max-width: 147.84em)': {
          display: 'none',
        },
      },
    },
    hiddenXxlUp: {
      selectors: {
        '@media (min-width: 105.105em)': {
          display: 'none',
        },
      },
    },
    hiddenXxxl: {
      selectors: {
        '@media (min-width: 147.763em)': {
          display: 'none',
        },
      },
    },
    link: {
      color: theme.semanticColors.link,
      textDecoration: 'none',
      selectors: {
        ':hover': {
          color: theme.semanticColors.linkHovered,
          textDecoration: 'underline',
        },
      },
    },
    modalHeader: {
      borderTop: `0.25em solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      fontSize: '1.5em',
      alignItems: 'center',
      fontWeight: parseInt(FontWeights.semibold.toString()),
      padding: '0.924em 0.924em 1.078em 1.848em',
    },
    modalBody: { padding: '0 1.848em 1.848em 1.848em' },
  } as Style);

export default style;
