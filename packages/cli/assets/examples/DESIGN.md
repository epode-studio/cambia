---
name: Acme Orders
description: Analytics-leaning admin app.
colors:
  primary: "#1A1C1E"
  on-primary: "#FFFFFF"
  secondary: "#6C7278"
  accent: "#B8422E"
  on-accent: "#FFFFFF"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 2rem
    fontWeight: 700
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
rounded:
  sm: 4px
  md: 8px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: 12px
  data-table:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
  field:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"

# --- Cambia extension (ignored by design.md's linter, read by `cambia`) ---
# DESIGN.md describes how things LOOK. Cambia adds what they DO (roles) and,
# optionally, what may personalize per user (adaptive).
cambia:
  version: "0.1"
  context:
    archetype: analytics
  roles:
    primary-action:
      component: button-primary
      conserved: [position-top-right]
      adaptive: []
    tabular-list:
      component: data-table
      conserved: [rows-are-records, sort-by-header, id-pinned-left]
      adaptive: [density, default-sort, promoted-action]
    form-field:
      component: field
      conserved: [always-labeled]
      adaptive: []
---

## Overview

Architectural minimalism with journalistic gravitas. Dense, scannable, calm.

## Colors

High-contrast neutrals with a single accent.

- **Primary (#1A1C1E):** deep ink for headlines and core text.
- **Accent (#B8422E):** the sole driver of interaction.
- **Neutral (#F7F5F2):** warm foundation, softer than pure white.

## Typography

Public Sans for everything except small caps labels (Space Grotesk).

## Components

- **button-primary:** the primary action.
- **data-table:** lists of records.
- **field:** form inputs.

## Do's and Don'ts

- Do use data-table for any list of records.
- Don't hand-roll tables or use raw `<table>`.
- Don't introduce colors outside the tokens.

## Adaptation

<!-- Cambia: human-readable rationale for the `cambia:` block above. Optional. -->

Tables may personalize **density**, **default sort**, and the **promoted row action**
per user. The grammar never changes — rows are always records, sort is always
header-click, the ID column is always pinned left. Everything else is conserved.
