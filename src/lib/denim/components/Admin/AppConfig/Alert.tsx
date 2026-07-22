// import React, { useState, useEffect } from "react";
// import { Stack } from "../lib";
// import { getStyle } from "../../../lib";

// interface Props {
//   close: () => void;
//   message: any;
//   duration?: number;
// }

// const Alert: React.FC<Props> = ({ close, message, duration = 3000 }) => {
//   const [dismiss, setDismiss] = useState(false);
//   useEffect(() => {
//     setTimeout(() => setDismiss(true), 0);
//   }, []);
//   setTimeout(() => close(), duration + 1000);
//   setTimeout(() => setDismiss(false), duration + 500);
//   const style = getStyle();
//   return (
//     <Stack className={`${style.alert} ${dismiss && style.alertDismissed}`}>
//       {message}
//     </Stack>
//   );
// };

// export default Alert;
