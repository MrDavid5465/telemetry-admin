import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton, DefaultButton, getTheme } from '@fluentui/react';

// Replaces window.confirm() app-wide — native confirm() is unreliable on
// mobile (confirmed: a user on mobile clicked a delete button and the
// browser never showed any dialog at all, so the click looked like it did
// nothing). This is a Promise-based, in-app equivalent: call confirmAsync()
// from any event handler (it must be async — there's no synchronous
// blocking dialog anymore), await the result, and proceed exactly like the
// old `if (!window.confirm(...)) return;` pattern.

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  // Red confirm button for destructive actions (delete, remove, etc).
  danger?: boolean;
}

type Opener = (message: string, options?: ConfirmOptions) => Promise<boolean>;

let currentOpener: Opener | null = null;

export function confirmAsync(message: string, options?: ConfirmOptions): Promise<boolean> {
  if (!currentOpener) {
    // ConfirmDialogHost isn't mounted (shouldn't happen — it's mounted once
    // at the app root) — fail back to the old behavior rather than silently
    // resolving true and letting a destructive action through unconfirmed.
    return Promise.resolve(window.confirm(message));
  }
  return currentOpener(message, options);
}

// Mount exactly once, at the app root — every confirmAsync() call anywhere
// in the app is served by this single instance.
export const ConfirmDialogHost: React.FC = () => {
  const [pending, setPending] = useState<{ message: string; options?: ConfirmOptions } | null>(null);
  const resolveRef = useRef<((result: boolean) => void) | null>(null);
  const theme = getTheme();

  const open = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
      setPending({ message, options });
    });
  }, []);

  // Registering the singleton instance is a side effect, not something to do
  // during render — do it after commit instead.
  useEffect(() => {
    currentOpener = open;
    return () => { currentOpener = null; };
  }, [open]);

  const close = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setPending(null);
  };

  // Only mount the Dialog (and its Layer) while something's actually
  // pending — leaving it permanently mounted with hidden={true} keeps its
  // Layer subscribed to the theme context always, which conflicts with
  // setTheme()/loadTheme() being called during the shell's own render on
  // every page load (React: "Cannot update a component while rendering a
  // different component").
  if (!pending) return null;

  return (
    <Dialog
      hidden={false}
      onDismiss={() => close(false)}
      dialogContentProps={{
        type: DialogType.normal,
        title: pending.options?.title ?? 'Confirm',
        subText: pending.message,
      }}
      modalProps={{ isBlocking: true }}
    >
      <DialogFooter>
        <PrimaryButton
          onClick={() => close(true)}
          text={pending.options?.confirmText ?? 'Delete'}
          styles={pending.options?.danger ? { root: { background: theme.palette.redDark, border: 'none' } } : undefined}
        />
        <DefaultButton onClick={() => close(false)} text={pending.options?.cancelText ?? 'Cancel'} />
      </DialogFooter>
    </Dialog>
  );
};
