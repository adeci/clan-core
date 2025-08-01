import { createSignal, JSX } from "solid-js";
import { Dialog as KDialog } from "@kobalte/core/dialog";
import styles from "./Modal.module.css";
import { Typography } from "../Typography/Typography";
import Icon from "../Icon/Icon";
import cx from "classnames";

export interface ModalContext {
  close(): void;
}

export interface ModalProps {
  id?: string;
  title: string;
  onClose: () => void;
  children: (ctx: ModalContext) => JSX.Element;
  mount?: Node;
  class?: string;
}

export const Modal = (props: ModalProps) => {
  const [open, setOpen] = createSignal(true);

  return (
    <KDialog id={props.id} open={open()} modal={true}>
      <KDialog.Portal mount={props.mount}>
        <KDialog.Content class={cx(styles.modal_content, props.class)}>
          <div class={styles.modal_header}>
            <Typography
              class={styles.modal_title}
              hierarchy="label"
              family="mono"
              size="xs"
            >
              {props.title}
            </Typography>
            <KDialog.CloseButton
              onClick={() => {
                setOpen(false);
                props.onClose();
              }}
            >
              <Icon icon="Close" size="0.75rem" />
            </KDialog.CloseButton>
          </div>
          <div class={styles.modal_body}>
            {props.children({
              close: () => {
                setOpen(false);
                props.onClose();
              },
            })}
          </div>
        </KDialog.Content>
      </KDialog.Portal>
    </KDialog>
  );
};
