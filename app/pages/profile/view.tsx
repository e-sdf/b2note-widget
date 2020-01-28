import * as React from "react";
import * as ReactDOM from "react-dom";
import { $enum } from "ts-enum-util";
import { Typeahead } from "react-bootstrap-typeahead";
import { Context } from "../../components/context";
import { countries, Experience } from "../../core/profile";
import * as api from "../../api/profile";
import { showAlertSuccess, showAlertWarning, showAlertError } from "../../components/ui"; 

const alertId = "profileAlert";

interface ProfileProps {
  context: Context;
}

export function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  const [nickname, setNickname] = React.useState(props.context.user?.nickname || "");
  const [organisation, setOrganisation] = React.useState(props.context.user?.organisation || "");
  const [jobTitle, setJobTitle] = React.useState(props.context.user?.jobTitle || "");
  const [country, setCountry] = React.useState(props.context.user?.country || "");
  const [experience, setExperience] = React.useState(props.context.user?.experience || "");

  function changeMade(): boolean {
    const orig = props.context.user;
    return nickname !== orig?.nickname || organisation !== orig?.organisation || jobTitle !== orig?.jobTitle || country !== orig?.country || experience !== orig?.experience;
  }

  function postProfile(): void {
    const changes = { nickname, organisation, jobTitle, country, experience };
    api.patchUserProfile(changes, props.context)
    .then(() => {
      showAlertSuccess(alertId, "Annotation updated");
    })
    .catch(error => {
      if (error.response.data && error.response.data.message) {
        showAlertWarning(alertId, error.response.data.message);
      } else {
        showAlertError(alertId, "Failed: server error");
      }
    });

  }

  function renderCountryInput(): React.ReactElement {
    return (
      <div className="form-group">
        <label>Country</label>
        <Typeahead
          options={countries}
          defaultInputValue={props.context.user?.country}
          selected={[country]}
          onChange={selected => {
            if (selected.length > 0) {
              setCountry(selected[0]);
            } else {
              setCountry("");
            }
          }} />
      </div>
    );
  }

  function renderExperienceInput(): React.ReactElement {
    return (
      <div className="form-group">
        <label>Annotator Experience</label>
        <select className="form-control" value={experience} onChange={ev => setExperience(ev.target.value)}>
          {$enum(Experience).getKeys().map(exp =>
            <option key={exp} value={Experience[exp]}>{Experience[exp]}</option>
          )}
        </select>
      </div>
    );
  }

  function renderSaveButton(): React.ReactElement {
    return (
      <div className="form-group">
        <button type="button" className="btn btn-primary"
          disabled={!changeMade()}
          onClick={() => postProfile()}>
          Save
      </button>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-2" style={{height: "450px", overflow: "auto"}}>
      <form>
        <div className="form-group">
          <label>Name</label>
          <input type="text" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="Read-only, value provided by B2ACCESS"
            value={props.context.user?.name || ""} />
        </div>
        <div className="form-group">
          <label>Nickname</label>
          <input type="text" className="form-control"
            value={nickname}
            onChange={ev => setNickname(ev.target.value)} />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="Read-only, value provided by B2ACCESS"
            value={props.context.user?.email || ""} />
        </div>
        <div className="form-group">
          <label>Organisation</label>
          <input type="text" className="form-control"
            value={organisation}
            onChange={ev => setOrganisation(ev.target.value)} />
        </div>
        <div className="form-group">
          <label>Job Title</label>
          <input type="text" className="form-control"
            value={jobTitle}
            onChange={ev => setJobTitle(ev.target.value)} />
        </div>
        {renderCountryInput()}
        {renderExperienceInput()}
        {renderSaveButton()}
      </form>
      <div className="row mt-2">
        <div className="col-sm">
          <div id={alertId}></div>
        </div>
      </div>
    </div>
  );
}

export function render(context: Context): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage context={context}/>, container);
  } else {
    console.error("#page element missing");
  }
}

