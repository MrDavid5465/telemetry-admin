import React, { Fragment, useState } from 'react';
import type { FormWrapperProps, Field } from './types';

// Keys that are per-form's own bookkeeping (form-level defaults/validation
// wiring), not meant for the rendered field component — everything else in a
// field's definition (type, label, options, and any template-specific extras
// like a custom field type's own props) passes through untouched, so a
// schema only needs to declare what should show a field, nothing more.
const FORM_INTERNAL_KEYS = ['section', 'sectionCollapsed', 'required', 'validations', 'display', 'defaultValue', 'defaultNull'];

function fieldRenderProps(definition: Field): Record<string, any> {
  const rest: Record<string, any> = {};
  for (const key of Object.keys(definition)) {
    if (!FORM_INTERNAL_KEYS.includes(key)) rest[key] = definition[key];
  }
  return rest;
}

// ─── Section accordion ───────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Generic collapsible group — not coupled to per-form's own field-grouping
// internals, so it's reusable as a standalone wrapper around any content
// (e.g. grouping several whole <Form> instances together), not just fields
// within one Form's own schema.
export function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '0.25em' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35em',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '0.3em 0 0.2em',
          fontWeight: 600,
          fontSize: '0.75em',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.65,
          borderBottom: '1px solid currentColor',
          marginBottom: '0.3em',
        }}
      >
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            fontSize: '0.7em',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        >
          ▶
        </span>
        {title}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── FormWrapper ─────────────────────────────────────────────────────────────

export default function FormWrapper<T>({
  dirty,
  errors,
  name: parent,
  onFocus,
  onChange,
  schema,
  Template,
  touched,
  values,
  fieldProps = {},
}: FormWrapperProps<T>): React.ReactElement {
  const entries = Object.entries(schema) as [string, Required<Field>][];

  // Fast path — no sections defined, behave exactly like the original library.
  const hasAnySections = entries.some(([, def]) => def.section);
  if (!hasAnySections) {
    return (
      <Fragment>
        {entries.map(([name, definition], i) => (
          <Template
            {...fieldRenderProps(definition)}
            dirty={dirty?.[name]}
            errors={errors[name]}
            key={`${name}-${i}`}
            name={name}
            onChange={onChange}
            onFocus={onFocus}
            parent={parent}
            touched={touched?.[name]}
            value={values[name]}
            {...(fieldProps[name] ?? {})}
          />
        ))}
      </Fragment>
    );
  }

  // Partition entries: unsectioned fields first, then one group per section
  // (preserving schema insertion order within each group).
  const unsectioned: [string, Required<Field>][] = [];
  const sectionMap = new Map<string, [string, Required<Field>][]>();

  for (const entry of entries) {
    const section = entry[1].section as string | undefined;
    if (!section) {
      unsectioned.push(entry);
    } else {
      if (!sectionMap.has(section)) sectionMap.set(section, []);
      sectionMap.get(section)!.push(entry);
    }
  }

  function renderField([name, definition]: [string, Required<Field>], i: number) {
    return (
      <Template
        {...fieldRenderProps(definition)}
        dirty={dirty?.[name]}
        errors={errors[name]}
        key={`${name}-${i}`}
        name={name}
        onChange={onChange}
        onFocus={onFocus}
        parent={parent}
        touched={touched?.[name]}
        value={values[name]}
        {...(fieldProps[name] ?? {})}
      />
    );
  }

  return (
    <Fragment>
      {unsectioned.map((entry, i) => renderField(entry, i))}
      {[...sectionMap.entries()].map(([sectionTitle, sectionEntries]) => {
        // sectionCollapsed only needs setting on one field per section
        // (typically whichever field a schema author thinks of first) —
        // any field in the group opting in starts the whole section closed.
        const collapsed = sectionEntries.some(([, def]) => def.sectionCollapsed);
        return (
          <Section key={sectionTitle} title={sectionTitle} defaultOpen={!collapsed}>
            {sectionEntries.map((entry, i) => renderField(entry, i))}
          </Section>
        );
      })}
    </Fragment>
  );
}
