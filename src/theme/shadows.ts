export const shadows = {
  resting: {
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1,
  },
  hover: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  active: {
    boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.10)',
    elevation: 3,
  },
  modal: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    elevation: 8,
  },
} as const;

export type ShadowsName = keyof typeof shadows;