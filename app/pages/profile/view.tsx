import * as React from "react";
import * as ReactDOM from "react-dom";
import { $enum } from "ts-enum-util";
import { Typeahead } from "react-bootstrap-typeahead";
import { Context } from "../../context";
import { countries, Experience } from "../../core/user";
import * as api from "../../api/profile";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 
import { UserProfile } from "../../../b2note-core/app/profile";

const alertId = "profileAlert";

interface ProfileProps {
  context: Context;
  updateProfileFn(profile: UserProfile): void;
}

export function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  const [profile, setProfile] = React.useState(null as UserProfile|null);
  const [nickname, setNickname] = React.useState(props.context.user?.nickname || "");
  const [organisation, setOrganisation] = React.useState(props.context.user?.organisation || "");
  const [jobTitle, setJobTitle] = React.useState(props.context.user?.jobTitle || "");
  const [country, setCountry] = React.useState(props.context.user?.country || "");
  const [experience, setExperience] = React.useState(props.context.user?.experience || "");
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    const mbUser = props.context.user;
    if (!mbUser) {
      console.error("User not logged");
    } else {
      api.getUserProfile(mbUser).then(
        res => setProfile(res),
        err => showAlertError(alertId, err) 
      );
    }
  }, []);

  function changeMade(): boolean {
    const orig = profile;
    return nickname !== orig?.nickname || organisation !== orig?.organisation || jobTitle !== orig?.jobTitle || country !== orig?.country || experience !== orig?.experience;
  }

  function postProfile(): void {
    if (panelRef.current) {
      const panelDOM = (panelRef.current as unknown) as Element;
      panelDOM.scrollTop = 0;
    }
    const nickname2 = nickname.length > 0 ? { nickname } : {};
    const organisation2 = organisation.length > 0 ? { organisation } : {};
    const jobTitle2 = jobTitle.length > 0 ? { jobTitle } : {};
    const country2 = country.length > 0 ? { country } : {};
    const experience2 = experience.length > 0 ? { experience } : {};
    const changes = { ...nickname2, ...organisation2, ...jobTitle2, ...country2, ...experience2 };
    const mbUser = props.context.user;
    if (mbUser) {
      api.patchUserProfile(changes, mbUser).then(
        updatedProfile => {
          props.updateProfileFn(updatedProfile);
          //TODO: does not show due to update of context.user prop
          showAlertSuccess(alertId, "Annotation updated");
        },
        (err: any) => {
          showAlertError(alertId, "Failed");
        }
      );
    } else {
      showAlertError(alertId, "User not logged");
    }
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
          <option key="none" value=""></option>
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
    <div ref={panelRef} className="container-fluid mt-2" style={{height: "450px", overflow: "auto"}}>
      <div className="row mt-2">
        <div className="col-sm">
          <div id={alertId}></div>
        </div>
      </div>
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
    </div>
  );
}

export function render(context: Context, updateProfileFn: (profile: UserProfile) => void): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage context={context} updateProfileFn={updateProfileFn}/>, container);
  } else {
    console.error("#page element missing");
  }
}

