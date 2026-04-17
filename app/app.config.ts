export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cepreuna',
      neutral: 'slate',
    },
    card: {
      slots: {
        root: 'rounded-xl overflow-hidden bg-surface-container-lowest text-on-surface ring ring-outline-variant/30 shadow-sm',
        body: 'p-4 sm:p-6',
        header: 'p-4 sm:px-6 border-b border-outline-variant/20',
        footer: 'p-4 sm:px-6 border-t border-outline-variant/20',
      },
    },
    modal: {
      slots: {
        content: 'bg-surface-container-lowest text-on-surface',
      },
    },
    input: {
      slots: {
        base: 'bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60',
      },
    },
    textarea: {
      slots: {
        base: 'bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60',
      },
    },
    select: {
      slots: {
        base: 'bg-surface-container-lowest text-on-surface',
      },
    },
    formField: {
      slots: {
        label: 'text-on-surface font-semibold',
      },
    },
  },
})
