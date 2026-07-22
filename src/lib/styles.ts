import { IStyle, ITheme, FontWeights } from "@fluentui/react";

interface IQStyles {
  card: IStyle;
  meetingCard: IStyle;
  waitingCard: IStyle;
  serverCard: IStyle;
  serverCardActive: IStyle;
  waitingArea: IStyle;
  waitingAreaCard: IStyle;
  wait: IStyle;
  inTarget: IStyle;
  targetClose: IStyle;
  pastTarget: IStyle;
  scheduled: IStyle;
  walkIn: IStyle;
  hereForYou: IStyle;
  icon: IStyle;
  meetingIcon: IStyle;
  intakeBox: IStyle;
  intakeHeader: IStyle;
  statusItem: IStyle;
  statusIcon: IStyle;
  statusIconIn: IStyle;
  statusIconIdle: IStyle;
  statusIconAway: IStyle;
  statusIconButton: IStyle;
  statusMenu: IStyle;
  availableUsersBar: IStyle;
  availableUsersPane: IStyle;
  availableUsersPaneHidden: IStyle;
  timeline: IStyle;
  iconWithText: IStyle;
  availableUsersScrollablePane: IStyle;
  logoLink: IStyle;
  userName: IStyle;
}

const styles = (theme: ITheme) =>
  ({
    card: {
      borderTop: `.25em solid ${theme.palette.themePrimary}`,
      padding: ".77em",
      boxShadow:
        "rgba(0, 0, 0, 0.133) 0em .22em .3em 0em, rgba(0, 0, 0, 0.11) 0em .05em .10em 0em"
    },
    serverCard: {
      minWidth: "18em",
      flexBasis: "23%",
      selectors: {
        ":hover": {
          background: theme.palette.neutralLighter,
          cursor: "pointer"
        },
        ":active": {
          background: theme.palette.neutralLight
        }
      }
    },
    serverCardActive: {
      width: "100%"
    },
    meetingCard: {
      padding: ".77em",
      background: theme.palette.blue,
      color: "#FFFFFF"
    },
    meetingIcon: { color: "#FFFFFF" },
    waitingCard: {
      padding: ".77em",
      background: theme.palette.yellowLight,
      color: "#000000"
    },
    waitingArea: {
      minWidth: "21.5em"
    },
    waitingAreaCard: {
      color: theme.palette.black,
      paddingLeft: ".77em"
    },
    wait: {
      padding: ".385em"
    },
    inTarget: {
      background: theme.palette.greenLight,
      color: "#000000"
    },
    targetClose: {
      background: theme.palette.yellow,
      color: "#000000"
    },
    pastTarget: {
      background: theme.palette.red,
      color: "#FFFFFF"
    },
    scheduled: { borderLeft: `.25em solid ${theme.palette.greenLight}` },
    walkIn: { borderLeft: `.25em solid ${theme.palette.yellow}` },
    hereForYou: { color: theme.palette.blue },
    icon: { fontSize: theme.fonts.large.fontSize },
    intakeBox: {
      marginTop: ".77em",
      marginBottom: ".77em",
      padding: "1.6em"
      // borderLeft: `0.25em solid ${theme.palette.themePrimary}`
    },
    intakeHeader: {
      fontSize: theme.fonts.medium.fontSize,
      fontWeight: FontWeights.bold
    },
    statusItem: {
      padding: ".77em",
      width: "100%",
      selectors: {
        ":hover": {
          background: theme.semanticColors.listItemBackgroundHovered,
          color: theme.semanticColors.linkHovered
        }
      }
    },
    statusIconButton: {
      height: "3.85em",
      width: "3.85em",
      padding: "0em",
      color: theme.semanticColors.primaryButtonText,
      selectors: {
        ":hover": {
          color: theme.semanticColors.primaryButtonTextHovered,
          backgroundColor: theme.semanticColors.primaryButtonBackgroundHovered
        },
        ":active": {
          color: theme.semanticColors.primaryButtonTextPressed,
          backgroundColor: theme.semanticColors.primaryButtonBackgroundPressed
        }
      }
    },
    statusIcon: {
      height: "2.31em",
      width: "2.31em"
    },
    statusIconIn: {
      color: theme.palette.greenLight
    },
    statusIconIdle: {
      color: theme.palette.yellow
    },
    statusIconAway: {
      color: theme.palette.red
    },
    statusMenu: {
      position: "fixed",
      top: "5.39em",
      maxWidth: "18em"
    },
    availableUsersBar: {
      position: "fixed",
      padding: "1.155em",
      bottom: "0em",
      left: "0em",
      marginLeft: "1em",
      background: theme.palette.white,
      boxShadow:
        "rgba(0, 0, 0, 0.133) 0em .22em .3em 0em, rgba(0, 0, 0, 0.11) 0em .05em .10em 0em",
      width: "21.5em",
      selectors: {
        ":hover": {
          background: theme.palette.neutralLighter,
          cursor: "pointer"
        },
        ":active": {
          background: theme.palette.neutralLight
        }
      }
    },
    availableUsersPane: {
      position: "fixed",
      bottom: "3.85em",
      left: "0em",
      marginLeft: "1em",
      height: "50vh",
      background: theme.palette.white,
      color: "#000000",
      boxShadow:
        "rgba(0, 0, 0, 0.133) 0em .22em .3em 0em, rgba(0, 0, 0, 0.11) 0em .05em .10em 0em",
      width: "21.5em",
      padding: ".77em"
    },
    availableUsersPaneHidden: {
      position: "fixed",
      bottom: "3.85em",
      left: "0em",

      marginLeft: "1em",
      height: "50vh",
      background: theme.palette.white,
      boxShadow:
        "rgba(0, 0, 0, 0.133) 0em .22em .3em 0em, rgba(0, 0, 0, 0.11) 0em .05em .10em 0em",
      width: "21.5em",
      padding: ".77em"
    },
    availableUsersScrollablePane: {
      position: "relative",
      height: "50vh"
    },
    timeline: {
      padding: "1.155em",
      margin: ".77em",
      fontSize: theme.fonts.large.fontSize
    },
    iconWithText: {
      margin: ".5em"
    },
    logoLink: {
      selectors: {
        ":hover": {
          cursor: "pointer"
        }
      }
    },
    userName: { color: theme.palette.black }
  } as IQStyles);

export default styles;
