import { Component, createEffect } from "solid-js";

import "./Terminal.css";
import { Typography } from "@/src/components/Typography";

export interface TerminalProps {
  lines: string[];
  rows?: number;
}

const Terminal: Component<TerminalProps> = ({ lines, rows = 20 }) => {
  let ref: HTMLTextAreaElement | undefined;

  createEffect(() => {
    // always scroll to the end of the output when it changes
    if (ref) {
      ref.scrollTop = ref.scrollHeight;
    }
  });

  const value = lines.join("\n");

  return (
    <textarea ref={ref} readOnly={true} rows={rows} value={value}></textarea>
  );
};

export default Terminal;
