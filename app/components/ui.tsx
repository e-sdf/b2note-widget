import * as React from "react";

// Panel {{{1
interface PanelProps {
  heading: React.ReactNode;
  inner?: boolean;
  children?: React.ReactNode;
}

export function Panel(props: PanelProps): React.ReactElement {
  return (
    <div className="card">
      <div className="card-body">
        {props.inner ?
          <h6 className="card-title">{props.heading}</h6>
        : <h5 className="card-title">{props.heading}</h5>}
        {props.children}
      </div>
    </div>
  );
}

// Modal {{{1
interface ModalProps {
  heading: React.ReactNode;
  width?: string;
  children?: React.ReactNode;
}

export class Modal extends React.Component<ModalProps> {
  private myRef: any;

  private getJQ = (): any => { 
    return $(this.myRef) as any;
  }

  public hide = () => {
    this.getJQ().modal("hide");
  }

  public render = () => {
    const w = this.props.width ? this.props.width : "auto"; 
    return (
      <div className="modal fade" id="app-modal" ref={(mRef) => this.myRef = mRef} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content" style={{width: w}}>
            <div className="modal-header">
              <h5 className="modal-title">{this.props.heading}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  public componentDidMount = () => {
    this.getJQ().modal("show");
  }

}

// Tabs {{{1
interface TabsProps<T> {
  activeTab: T;
  activeHandle?: (newTab: T) => void;
  id: string;
  children?: any;
}

export function Tabs<T>(props: TabsProps<T>): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState(props.activeTab);

  function activeCls(tab: React.ReactElement): string {
    return tab ?
      tab.props.tabId === activeTab ? " active" : ""
      : "";
  }

  return (
    <div>
      <ul className="nav nav-tabs" id={props.id} role="tablist">
        {!props.children ? <></> : props.children.map((tab: React.ReactElement) =>
          <li key={tab.props.tabId} className="nav-item">
            <a className={"nav-link" + activeCls(tab)} id={`${tab.props.tabId}-tab`} href="#"
              onClick={() => {
                setActiveTab(tab.props.tabId);
                if (props.activeHandle) { props.activeHandle(tab.props.tabId); }
              }}>
              {tab.props.title}
            </a>
          </li>
        )}
      </ul>
      <div className="tab-content">
        {!props.children ? <></> : props.children.map((tab: React.ReactElement) =>
        <div
          key={tab.props.tabId}
          id={tab.props.tabId}
          className={"tab-pane" + activeCls(tab)}
          role="tabpanel">
          {tab.props.children}
        </div>
      )}
    </div>
  </div>
  );
}

// Tab {{{1
interface TabProps<T> {
  tabId: T;
  title: React.ReactNode;
  children?: any;
}

export function Tab<T>(props: TabProps<T>): React.ReactElement {
  return (<></>);
}

// Confirm {{{1

interface ConfirmProps {
  heading: React.ReactNode;
  subject: string;
  body: React.ReactNode;
  resolve: () => any;
  reject: () => void;
}

export class Confirm extends React.Component<ConfirmProps> {

  private modalRef: any;

  private confirm = () => {
    this.modalRef.hide();
    this.props.resolve();
  }

  private cancel = () => {
    this.modalRef.hide();
    this.props.reject();
  }

  public render = () => {
    return (
      <Modal heading={this.props.heading} ref={(mRef) => this.modalRef = mRef}>
        <div className="container-fluid">
          <div className="row form-group">
            <div className="col my-auto">
              {this.props.body}
            </div>
          </div>
          <div className="row form-group">
            <div className="col my-auto">
              <button type="button" className="btn btn-danger" onClick={this.confirm}>
                Confirm {this.props.subject}
              </button>
            </div>
            <div className="col my-auto">
              <button type="button" className="btn btn-outline-danger" onClick={this.cancel}>
                Cancel {this.props.subject}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

//export function renderConfirmPm(heading: React.ReactNode, subject: string, body: React.ReactNode): Promise<any> {
  //return new Promise((resolve, reject) => {
    //const panel = panels.getModal();
    //if (panel) {
      //ReactDOM.render(<Confirm heading={heading} subject={subject} body={body} resolve={resolve} reject={reject}/>, panel);
    //}
  //});
//}
