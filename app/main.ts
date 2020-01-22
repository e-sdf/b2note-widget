import { Target } from "./core/annotationsModel";
import * as context from "./components/context";
import * as widget from "./widget/view";

const target: Target = {
  pid: "http://hdl.handle.net/11304/3720bb44-831c-48f3-9847-6988a41236e1",
  source: "https://b2share.eudat.eu/records/b1092be3cd4844e0bffd7b669521ba3c"
};

const sampleContext = context.mkContext(target);

$(document).ready(() => {
  widget.render(sampleContext);
});