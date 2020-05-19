import * as React from "react";
import * as icons from "./icons";

export interface PaginatorProps {
  maxPage: number;
  pageChangedFn(p: number): void;
}

export default function Paginator(props: PaginatorProps): React.FunctionComponentElement<PaginatorProps> {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => props.pageChangedFn(page), [page]);

  function setNew(n: number): void {
    setPage(
        n < 1 ? 1
      : n > props.maxPage ? props.maxPage
      : n
    );
  }

  function setPageFromString(s: string) {
    try {
      const n = JSON.parse(s);
      if (typeof n === "number") {
        setNew(n);
      }
    } catch(error) { void(0); }
  }

  function inputWidth(): number {
    const digits = props.maxPage.toString().length;  
    return digits * 10 + 20;
  }

  function renderGoLeft(): React.ReactElement {
    return (
      <li className="page-item">
        <a className="page-link" href="#" aria-label="Previous"
          data-toggle="tooltip" data-placement="left" title="Previous page"
          onClick={() => setNew(page - 1)}
        ><span aria-hidden="true"><icons.LeftIcon/></span>
        </a>
      </li>
    );
  }

  function renderGoRight(): React.ReactElement {
    return (
      <li className="page-item">
        <a className="page-link" href="#" aria-label="Next"
          data-toggle="tooltip" data-placement="right" title="Next page"
          onClick={() => setNew(page + 1)}
        ><span aria-hidden="true"><icons.RightIcon/></span>
        </a>
      </li>
    );
  }

  function renderInput(): React.ReactElement {
    return (
      <input type="number" className="form-control" 
        style={{padding: "0 0 0 2px", width: inputWidth() + 10, height: 31, textAlign: "center"}}
        value={page}
        onChange={ev => setPageFromString(ev.target.value)}/>
    );
  }

  function renderMax(): React.ReactElement {
    return (
      <input type="number" className="form-control" 
        style={{padding: "0 0 0 2px", width: inputWidth(), height: 31, textAlign: "center"}} 
        readOnly={true}
        value={props.maxPage}/>
    );
  }
  return (
    <nav
      style={{backgroundColor: "white"}} aria-label="Pages navigation">
      <ul 
        className="pagination pagination-sm justify-content-center"
        style={{margin: 0}}>
        {renderGoLeft()}
        {renderInput()}
        /
        {renderMax()}
        {renderGoRight()}
      </ul>
    </nav>
  );
}
