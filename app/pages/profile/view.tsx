import * as React from "react";
import * as ReactDOM from "react-dom";
import { $enum } from "ts-enum-util";
import { Typeahead } from "react-bootstrap-typeahead";
import type { UserProfile } from "../../core/user";
import { countries, Experience } from "../../core/user";
import * as api from "../../api/profile";
import { showAlertSuccess, showAlertError } from "../../components/ui"; 

const alertId = "profileAlert";

interface ProfileProps {
  profile: UserProfile;
  updateProfileFn(profile: UserProfile): void;
}

export function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  const [orcid, setOrcid] = React.useState(props.profile.orcid);
  const [organisation, setOrganisation] = React.useState(props.profile.organisation);
  const [jobTitle, setJobTitle] = React.useState(props.profile.jobTitle);
  const [country, setCountry] = React.useState(props.profile.country);
  const [experience, setExperience] = React.useState(props.profile.experience);
  const panelRef = React.useRef(null);

  function changeMade(): boolean {
    const orig = props.profile;
    return orcid !== orig?.orcid || organisation !== orig?.organisation || jobTitle !== orig?.jobTitle || country !== orig?.country || experience !== orig?.experience;
  }

  function postProfile(): void {
    if (panelRef.current) {
      const panelDOM = (panelRef.current as unknown) as Element;
      panelDOM.scrollTop = 0;
    }
    const orcid2 = orcid.length > 0 ? { orcid } : {};
    const organisation2 = organisation.length > 0 ? { organisation } : {};
    const jobTitle2 = jobTitle.length > 0 ? { jobTitle } : {};
    const country2 = country.length > 0 ? { country } : {};
    const experience2 = experience.length > 0 ? { experience } : {};
    const changes = { ...orcid2, ...organisation2, ...jobTitle2, ...country2, ...experience2 };
    const mbUser = props.profile;
    if (mbUser) {
      api.patchUserProfile(changes, mbUser).then(
        updatedProfile => {
          props.updateProfileFn(updatedProfile);
          showAlertSuccess(alertId, "Profile updated");
        },
        () => {
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
          id="profile-country-autocomplete"
          options={countries}
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
        <select className="form-control" value={experience} onChange={ev => setExperience(ev.target.value as Experience)}>
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
            value={props.profile?.name || ""} />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="Read-only, value provided by B2ACCESS"
            value={props.profile?.email || ""} />
        </div>
        <div className="form-group">
          <label>ORCID ID</label>
          <input type="text" className="form-control"
            value={orcid}
            onChange={ev => setOrcid(ev.target.value)} />
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

export function render(profile: UserProfile, updateProfileFn: (profile: UserProfile) => void): void {
  const container = document.getElementById("page");
  if (container) {
    ReactDOM.render(<ProfilePage profile={profile} updateProfileFn={updateProfileFn}/>, container);
  } else {
    console.error("#page element missing");
  }
}

