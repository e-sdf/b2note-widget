import * as React from "react";

export function renderDeleteConfirmation(deleteFn: () => void, cancelFn: () => void): React.ReactElement {
  return (
    <div className="alert alert-danger condensed">
      <div className="d-flex flex-row justify-content-center">
        <div className="font-italic">Really delete the item?</div>
      </div>
      <div className="d-flex flex-row justify-content-center mt-2">
        <button type="button"
          className="btn btn-sm btn-danger mr-3"
          style={{marginLeft: "5px", marginRight: "5px"}}
          onClick={deleteFn}>
          Yes
        </button>
        <button type="button"
          className="btn btn-sm btn-success ml-3"
          style={{marginLeft: "5px"}}
          onClick={cancelFn}>
          No
        </button>
      </div>
    </div>
  );
}
