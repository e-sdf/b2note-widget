import _ from "lodash";
import * as React from "react";
import type { ConfRec } from "app/config";
import { $enum } from "ts-enum-util";
import { Typeahead } from "react-bootstrap-typeahead";
import type { AuthUser } from "app/context";
import type { AuthErrAction } from "core/http";
import type { UserProfile } from "core/user";
import { countries, Experience } from "core/user";
import * as api from "app/api/profile";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";

interface ProfileProps {
  config: ConfRec;
  user: AuthUser;
  updateProfileFn(profile: UserProfile): void;
  authErrAction: AuthErrAction;
}

export default function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  const [givenName, setGivenName] = React.useState(props.user.profile.givenName);
  const [familyName, setFamilyName] = React.useState(props.user.profile.familyName);
  const [personName, setPersonName] = React.useState(props.user.profile.personName);
  const [orcid, setOrcid] = React.useState(props.user.profile.orcid);
  const [organisation, setOrganisation] = React.useState(props.user.profile.organisation);
  const [jobTitle, setJobTitle] = React.useState(props.user.profile.jobTitle);
  const [country, setCountry] = React.useState(props.user.profile.country);
  const [experience, setExperience] = React.useState(props.user.profile.experience);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const fields = [givenName, familyName, personName, orcid, organisation, jobTitle, country, experience];
  const [changed, setChanged] = React.useState(false);
  const panelRef = React.useRef(null);

  function getFields(): Partial<UserProfile> {
    const givenName2 = givenName.length > 0 ? { givenName } : {};
    const familyName2 = familyName.length > 0 ? { familyName } : {};
    const personName2 = personName.length > 0 ? { personName } : {};
    const orcid2 = orcid.length > 0 ? { orcid } : {};
    const organisation2 = organisation.length > 0 ? { organisation } : {};
    const jobTitle2 = jobTitle.length > 0 ? { jobTitle } : {};
    const country2 = country.length > 0 ? { country } : {};
    const experience2 = experience.length > 0 ? { experience } : {};
    const changes = { ...givenName2, ...familyName2, ...personName2, ...orcid2, ...organisation2, ...jobTitle2, ...country2, ...experience2 };
    return changes;
  }

  React.useEffect(
    () => {
      const p = props.user.profile;
      const current: Partial<UserProfile> = {
        givenName,
        familyName,
        personName,
        orcid,
        organisation,
        jobTitle,
        country,
        experience
      };
      const orig: Partial<UserProfile> = {
        givenName: p.givenName,
        familyName: p.familyName,
        personName: p.personName,
        orcid: p.orcid,
        organisation: p.organisation,
        jobTitle: p.jobTitle,
        country: p.country,
        experience: p.experience
      };
      setChanged(!_.isEqual(current, orig));
    },
    fields
  );


  function postProfile(): void {
    setLoading(true);
    api.patchUserProfilePm(props.config, getFields(), props.user.token, props.authErrAction).then(
      updatedProfile => {
        props.updateProfileFn(updatedProfile);
        setLoading(false);
        setChanged(false);
        setSuccessMessage("Profile updated");
      },
      () => { setLoading(false); setErrorMessage("Profile update failed"); }
    );
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
          {$enum(Experience).getKeys()
            .filter(exp => Experience[exp].length > 0)
            .map(exp => <option key={exp} value={Experience[exp]}>{Experience[exp]}</option>
          )}
        </select>
      </div>
    );
  }

  function renderSaveButton(): React.ReactElement {
    return (
      <div className="form-group d-flex flex-row justify-content-center">
        <button type="button" className="btn btn-primary"
          disabled={!changed}
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
          <label>B2NOTE ID</label>
          <input type="text" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="B2NOTE user persistent identifier; read-only, value provided by B2NOTE"
            value={props.user.profile?.id || ""} />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input type="email" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="Read-only, value provided by B2ACCESS"
            value={props.user.profile?.email || ""} />
        </div>
        <div className="form-group">
          <label>Given Name</label>
          <input type="text" className="form-control"
            value={givenName}
            onChange={ev => setGivenName(ev.target.value)} />
        </div>
        <div className="form-group">
          <label>Family Name</label>
          <input type="text" className="form-control"
            value={familyName}
            onChange={ev => setFamilyName(ev.target.value)} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" className="form-control"
            value={personName}
            onChange={ev => setPersonName(ev.target.value)} />
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
        {successMessage || errorMessage ?
          <div className="d-flex flex-row justify-content-center">
            <SpinningWheel show={loading}/>
            <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
            <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
          </div>
        : renderSaveButton()}
      </form>
    </div>
  );
}
