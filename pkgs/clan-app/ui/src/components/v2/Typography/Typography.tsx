import { type JSX, mergeProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import cx from "classnames";
import "./Typography.css";
import { Color, fgClass } from "@/src/components/v2/colors";

export type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
export type Hierarchy = "body" | "title" | "headline" | "label" | "teaser";
export type Weight = "normal" | "medium" | "bold";
export type Family = "regular" | "condensed" | "mono";

// type Size = "default" | "xs" | "s" | "m" | "l";
interface SizeForHierarchy {
  body: {
    default: string;
    s: string;
    xs: string;
    xxs: string;
  };
  label: {
    default: string;
    s: string;
    xs: string;
  };
  headline: {
    default: string;
    m: string;
    l: string;
  };
  title: {
    default: string;
    m: string;
    l: string;
  };
  teaser: {
    default: string;
  };
}

export type AllowedSizes<H extends Hierarchy> = keyof SizeForHierarchy[H];

const sizeHierarchyMap: SizeForHierarchy = {
  body: {
    default: cx("font-size-default"),
    s: cx("font-size-s"),
    xs: cx("font-size-xs"),
    xxs: cx("font-size-xxs"),
  },
  headline: {
    default: cx("font-size-default"),
    m: cx("font-size-m"),
    l: cx("font-size-l"),
  },
  title: {
    default: cx("font-size-default"),
    // xs: cx("font-size-xs"),
    // s: cx("font-size-s"),
    m: cx("font-size-m"),
    l: cx("font-size-l"),
  },
  label: {
    default: cx("font-size-default"),
    s: cx("font-size-s"),
    xs: cx("font-size-xs"),
  },
  teaser: {
    default: cx("font-size-default"),
  },
};

const defaultFamilyMap: Record<Hierarchy, Family> = {
  body: "condensed",
  label: "condensed",
  title: "regular",
  headline: "regular",
  teaser: "regular",
};

const weightMap: Record<Weight, string> = {
  normal: cx("font-weight-normal"),
  medium: cx("font-weight-medium"),
  bold: cx("font-weight-bold"),
};

interface _TypographyProps<H extends Hierarchy> {
  hierarchy: H;
  size: AllowedSizes<H>;
  color?: Color;
  children: JSX.Element;
  weight?: Weight;
  family?: Family;
  inverted?: boolean;
  tag?: Tag;
  class?: string;
  classList?: Record<string, boolean>;
}

export const Typography = <H extends Hierarchy>(props: _TypographyProps<H>) => {
  const family = () =>
    `font-family-${props.family || defaultFamilyMap[props.hierarchy]}`;

  const classList = mergeProps(props.classList, {
    "font-body": props.hierarchy === "body" || !props.hierarchy,
    "font-label": props.hierarchy === "label",
    "font-title": props.hierarchy === "title",
    "font-headline": props.hierarchy === "headline",
    "font-teaser": props.hierarchy === "teaser",
  });

  return (
    <Dynamic
      class={cx(
        "typography",
        family(),
        weightMap[props.weight || "normal"],
        sizeHierarchyMap[props.hierarchy][props.size] as string,
        fgClass(props.color, props.inverted),
        props.class,
      )}
      component={props.tag || "span"}
      classList={classList}
    >
      {props.children}
    </Dynamic>
  );
};

export type TypographyProps = _TypographyProps<Hierarchy>;
