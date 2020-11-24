import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";

interface AlertProps {
  type: "success" | "warning" | "danger";
  message: React.ReactNode|null;
  closedHandler(): void;
}

export default function Alert(props: AlertProps): React.FunctionComponentElement<AlertProps> {

  const [show, setShow] = React.useState(props.message !== null);

  function getTimeout(): number {
    return matchSwitch(props.type, {
      ["success"]: () => 1500,
      ["warning"]: () => 2000,
      ["danger"]: () => 0
    });
  }

  function close(): void {
    setShow(false);
    props.closedHandler();
  }

  React.useEffect(() => {
    const msg = props.message;
    if (msg) {
      setShow(true);
      const timeout = getTimeout();
      if (timeout > 0) {
        const timer = setTimeout(() => {
          close();
        }, timeout);
        return () => clearTimeout(timer);
      }
    } else {
      close();
    }
  }, [props.message]);

  return (
    show ?
      <div className={`alert alert-${props.type} fade show mt-1`} role="alert">
        {props.message}
        <button type="button" className="close" style={{paddingLeft: "1em"}} aria-label="Close"
          onClick={() => close()}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    : <></>
  );
}

