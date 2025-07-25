import {
  Accessor,
  Component,
  createSignal,
  Match,
  Setter,
  Show,
  Switch,
} from "solid-js";
import { RouteSectionProps, useNavigate } from "@solidjs/router";
import "./Onboarding.css";
import { Typography } from "@/src/components/Typography/Typography";
import { Button } from "@/src/components/Button/Button";
import { Alert } from "@/src/components/Alert/Alert";

import { Divider } from "@/src/components/Divider/Divider";
import { Logo } from "@/src/components/Logo/Logo";
import { navigateToClan, selectClanFolder } from "@/src/hooks/clan";
import { activeClanURI, addClanURI, setActiveClanURI } from "@/src/stores/clan";
import {
  createForm,
  FormStore,
  getError,
  getErrors,
  getValue,
  SubmitHandler,
  valiForm,
} from "@modular-forms/solid";
import { TextInput } from "@/src/components/Form/TextInput";
import { TextArea } from "@/src/components/Form/TextArea";
import { Fieldset } from "@/src/components/Form/Fieldset";
import * as v from "valibot";
import { HostFileInput } from "@/src/components/Form/HostFileInput";
import { callApi } from "@/src/hooks/api";
import { Creating } from "./Creating";

type State = "welcome" | "setup" | "creating";

const SetupSchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty("Please enter a name."),
    v.regex(
      new RegExp("^[a-zA-Z0-9_\\-]+$"),
      "Name must be alphanumeric and can contain underscores and dashes, without spaces.",
    ),
  ),
  description: v.pipe(v.string(), v.nonEmpty("Please describe your clan.")),
  directory: v.pipe(
    // initial value is undefined, and I can't see how to handle this better in valibot, so for now when the type
    // is incorrect we treat it as empty
    v.string("Please select a directory."),
    v.nonEmpty("Please select a directory."),
  ),
});

type SetupForm = v.InferInput<typeof SetupSchema>;

const background = (props: { state: State; form: FormStore<SetupForm> }) => (
  <div class="background">
    <div class="layer-1" />
    <div class="layer-2" />
    <div class="layer-3" />
    <Logo variant="Darknet" inverted={true} />
    <Logo variant="Clan" inverted={true} />
    <Show when={props.state === "setup"}>
      <div class="darknet-info">
        <Typography
          class="darknet-label"
          hierarchy="label"
          family="mono"
          size="default"
          color="inherit"
          weight="medium"
          inverted={true}
        >
          Your Darknet:
        </Typography>
        <Typography
          class="darknet-name"
          hierarchy="teaser"
          size="default"
          color="inherit"
          weight="medium"
          inverted={true}
        >
          {getValue(props.form, "name")}
        </Typography>
      </div>
    </Show>
  </div>
);

const welcome = (props: {
  setState: Setter<State>;
  welcomeError: Accessor<string | undefined>;
  setWelcomeError: Setter<string | undefined>;
}) => {
  const navigate = useNavigate();

  const selectFolder = async () => {
    const uri = await selectClanFolder();
    navigateToClan(navigate, uri);
  };

  return (
    <div class="welcome">
      <Typography
        hierarchy="headline"
        size="xxl"
        weight="bold"
        align="center"
        inverted={true}
      >
        Build your <br />
        own darknet
      </Typography>
      {props.welcomeError() && (
        <Alert
          type="error"
          icon="Info"
          title="Your Clan creation failed"
          description={props.welcomeError() || ""}
        />
      )}
      <Button
        hierarchy="secondary"
        onClick={() => {
          // reset welcome error
          props.setWelcomeError(undefined);
          // move to next step
          props.setState("setup");
        }}
      >
        Start building
      </Button>
      <div class="separator">
        <Divider orientation="horizontal" inverted={true} />
        <Typography
          hierarchy="body"
          size="s"
          weight="medium"
          inverted={true}
          align="center"
        >
          or
        </Typography>
        <Divider orientation="horizontal" inverted={true} />
      </div>
      <Button hierarchy="primary" ghost={true} onAction={selectFolder}>
        Select folder
      </Button>
    </div>
  );
};

export const Onboarding: Component<RouteSectionProps> = (props) => {
  const navigate = useNavigate();

  const activeURI = activeClanURI();
  if (activeURI) {
    // the user has already selected a clan, so we should navigate to it
    console.log("active clan detected, navigating to it", activeURI);
    navigateToClan(navigate, activeURI);
  }

  const [state, setState] = createSignal<State>("welcome");

  // used to display an error in the welcome screen in the event of a failed
  // clan creation
  const [welcomeError, setWelcomeError] = createSignal<string | undefined>();

  //
  const [setupForm, { Form, Field }] = createForm<SetupForm>({
    validate: valiForm(SetupSchema),
  });

  const formError = () => {
    const formErrors = getErrors(setupForm);
    return (
      formErrors.name ||
      formErrors.description ||
      formErrors.directory ||
      undefined
    );
  };

  const onSelectFile = async () => {
    const req = callApi("get_system_file", {
      file_request: {
        mode: "select_folder",
        title: "Select a folder for you new Clan",
      },
    });

    const resp = await req.result;

    if (resp.status === "error") {
      // just throw the first error, I can't imagine why there would be multiple
      // errors for this call
      throw new Error(resp.errors[0].message);
    }

    if (resp.status === "success" && resp.data) {
      return resp.data[0];
    }

    throw new Error("No data returned from api call");
  };

  const onSubmit: SubmitHandler<SetupForm> = async (
    { name, description, directory },
    event,
  ) => {
    const path = `${directory}/${name}`;

    const req = callApi("create_clan", {
      opts: {
        dest: path,
        // todo allow users to select a template
        template: "minimal",
        initial: {
          name,
          description,
        },
      },
    });

    setState("creating");

    const resp = await req.result;

    if (resp.status === "error") {
      setWelcomeError(resp.errors[0].message);
      setState("welcome");
      return;
    }

    if (resp.status === "success") {
      addClanURI(path);
      setActiveClanURI(path);
      navigateToClan(navigate, path);
    }
  };

  return (
    <main id="welcome">
      {background({ form: setupForm, state: state() })}
      <div class="container">
        <Switch>
          <Match when={state() === "welcome"}>
            {welcome({
              setState,
              welcomeError,
              setWelcomeError,
            })}
          </Match>

          <Match when={state() === "setup"}>
            <div class="setup">
              <div class="header">
                <Button
                  hierarchy="secondary"
                  ghost={true}
                  icon="ArrowLeft"
                  onClick={() => setState("welcome")}
                />
                <Typography hierarchy="headline" size="default" weight="bold">
                  Setup
                </Typography>
              </div>
              <Form onSubmit={onSubmit}>
                {formError() && (
                  <Alert
                    type="error"
                    icon="Info"
                    title="Form error"
                    description={formError() || ""}
                  />
                )}
                <Fieldset name="meta">
                  <Field name="name">
                    {(field, input) => (
                      <TextInput
                        {...field}
                        label="Name"
                        value={field.value}
                        required
                        orientation="horizontal"
                        validationState={
                          getError(setupForm, "name") ? "invalid" : "valid"
                        }
                        input={{
                          ...input,
                          placeholder: "Name your Clan",
                        }}
                      />
                    )}
                  </Field>
                  <Divider inverted={true} />
                  <Field name="description">
                    {(field, input) => (
                      <TextArea
                        {...field}
                        value={field.value}
                        label="Description"
                        required
                        orientation="horizontal"
                        validationState={
                          getError(setupForm, "description")
                            ? "invalid"
                            : "valid"
                        }
                        input={input}
                      />
                    )}
                  </Field>
                </Fieldset>

                <Fieldset name="location">
                  <Field name="directory">
                    {(field, input) => (
                      <HostFileInput
                        onSelectFile={onSelectFile}
                        {...field}
                        value={field.value}
                        label="Select directory"
                        orientation="horizontal"
                        required={true}
                        validationState={
                          getError(setupForm, "directory") ? "invalid" : "valid"
                        }
                        input={input}
                      />
                    )}
                  </Field>
                </Fieldset>

                <div class="form-controls">
                  <Button
                    type="submit"
                    hierarchy="primary"
                    endIcon="ArrowRight"
                  >
                    Next
                  </Button>
                </div>
              </Form>
            </div>
          </Match>

          <Match when={state() === "creating"}>
            <Creating />
          </Match>
        </Switch>
      </div>
    </main>
  );
};
