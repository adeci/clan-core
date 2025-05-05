import { callApi } from "@/src/api";
import {
  createForm,
  SubmitHandler,
  validate,
  FieldValues,
} from "@modular-forms/solid";
import { createQuery } from "@tanstack/solid-query";
import { StepProps } from "./hardware-step";
import { Typography } from "@/src/components/Typography";
import { Group } from "@/src/components/group";
import { For, Match, Show, Switch } from "solid-js";
import { TextInput } from "@/src/Form/fields";
import toast from "solid-toast";

export type VarsValues = FieldValues & Record<string, Record<string, string>>;

export const VarsStep = (props: StepProps<VarsValues>) => {
  const [formStore, { Form, Field }] = createForm<VarsValues>({
    // initialValues: { ...props.initial, schema: "single-disk" },
  });

  const handleSubmit: SubmitHandler<VarsValues> = async (values, event) => {
    console.log("Submit Disk", { values });
    const valid = await validate(formStore);
    if (generatorsQuery.data === undefined) {
      toast.error("Error fetching data");
      return;
    }
    const loading_toast = toast.loading("Generating vars...");
    const result = await callApi("generate_vars_for_machine", {
      machine_name: props.machine_id,
      base_dir: props.dir,
      generators: generatorsQuery.data.map((generator) => generator.name),
      all_prompt_values: values,
    });
    toast.dismiss(loading_toast);
    if (result.status === "error") {
      toast.error(result.errors[0].message);
      return;
    }
  };

  const generatorsQuery = createQuery(() => ({
    queryKey: [props.dir, props.machine_id, "generators"],
    queryFn: async () => {
      const result = await callApi("get_generators", {
        base_dir: props.dir,
        machine_name: props.machine_id,
      });
      if (result.status === "error") throw new Error("Failed to fetch data");
      return result.data;
    },
  }));

  return (
    <Form
      onSubmit={handleSubmit}
      class="flex h-full flex-col gap-6"
      noValidate={false}
    >
      <div class="max-h-[calc(100vh-20rem)] overflow-y-scroll">
        <div class="flex h-full flex-col gap-6 p-4">
          <Switch>
            <Match when={generatorsQuery.isLoading}>Loading ...</Match>
            <Match when={generatorsQuery.data}>
              {(generators) => (
                <For each={generators()}>
                  {(generator) => (
                    <Group>
                      <Typography hierarchy="label" size="default">
                        {generator.name}
                      </Typography>
                      <div>
                        Bound to module (shared):{" "}
                        {generator.share ? "True" : "False"}
                      </div>
                      <For each={generator.prompts}>
                        {(prompt) => (
                          <Group>
                            <Typography hierarchy="label" size="s">
                              {!prompt.previous_value ? "Required" : "Optional"}
                            </Typography>
                            <Typography hierarchy="label" size="s">
                              {prompt.name}
                            </Typography>
                            <Field name={`${generator.name}.${prompt.name}`}>
                              {(field, props) => (
                                <TextInput
                                  inputProps={props}
                                  label={prompt.description}
                                  value={prompt.previous_value ?? ""}
                                  error={field.error}
                                  // class="col-span-2"
                                  // required
                                />
                              )}
                            </Field>
                          </Group>
                        )}
                      </For>
                    </Group>
                  )}
                </For>
              )}
            </Match>
          </Switch>
        </div>
      </div>
      <Show when={generatorsQuery.isFetched}>{props.footer}</Show>
      <button type="submit">Submit</button>
    </Form>
  );
};
