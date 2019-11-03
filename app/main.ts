import { Resource } from "./api/resource";
import { User } from "./api/profile";
import { Context } from "./widget/context";
import * as widget from "./widget/view";

const resource: Resource = {
  pid: "http://hdl.handle.net/11304/3720bb44-831c-48f3-9847-6988a41236e1",
  subject: "https://b2share.eudat.eu/records/b1092be3cd4844e0bffd7b669521ba3c"
};

const user: User = {
  id: "e4619431-6087-43bb-a241-1c48674f5156",
  nickname: "Robert Pergl"
};

const apiURL = "https://localhost:3050/api";

const context: Context = {
  user,
  resource
};

$(document).ready(() => {
  widget.render(context);
});