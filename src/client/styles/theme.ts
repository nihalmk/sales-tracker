import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineSlotRecipe,
} from '@chakra-ui/react';

const tableSlotRecipe = defineSlotRecipe({
  slots: [
    'root',
    'header',
    'body',
    'row',
    'columnHeader',
    'cell',
    'caption',
    'footer',
  ],
  base: {
    columnHeader: {
      fontSize: 'xs',
      fontWeight: 'semibold',
      textTransform: 'uppercase',
      letterSpacing: 'wider',
      color: 'gray.500',
    },
    row: {
      transition: 'background-color 0.12s ease-in',
      _hover: {
        bg: 'gray.50',
      },
    },
  },
  variants: {
    striped: {
      true: {
        row: {
          '&:nth-of-type(odd) td': {
            bg: 'gray.50',
          },
        },
      },
    },
    variant: {
      outline: {
        root: {
          borderRadius: 'l2',
          boxShadow: '0 0 0 1px {colors.gray.200}',
        },
        header: {
          bg: 'gray.50',
        },
        columnHeader: {
          borderBottomWidth: '2px',
          borderBottomColor: 'gray.200',
        },
      },
    },
    size: {
      sm: {
        columnHeader: {
          py: '2.5',
        },
        cell: {
          py: '2.5',
        },
      },
    },
  },
});

const cardSlotRecipe = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer'],
  base: {
    root: {
      boxShadow:
        '0 12px 28px -8px {colors.gray.400}, 0 4px 10px -6px {colors.gray.300}',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      _hover: {
        boxShadow:
          '0 18px 36px -10px {colors.gray.400}, 0 6px 14px -6px {colors.gray.300}',
      },
    },
  },
});

const config = defineConfig({
  theme: {
    slotRecipes: {
      table: tableSlotRecipe,
      card: cardSlotRecipe,
    },
    tokens: {
      colors: {
        brand: {
          50: { value: '#eff6ff' },
          100: { value: '#dbeafe' },
          200: { value: '#bfdbfe' },
          300: { value: '#93c5fd' },
          400: { value: '#60a5fa' },
          500: { value: '#2563eb' },
          600: { value: '#1d4ed8' },
          700: { value: '#1e40af' },
          800: { value: '#1e3a8a' },
          900: { value: '#172554' },
          950: { value: '#0f172a' },
        },
        gray: {
          50: { value: '#f8fafc' },
          100: { value: '#f1f5f9' },
          200: { value: '#e2e8f0' },
          300: { value: '#cbd5e1' },
          400: { value: '#94a3b8' },
          500: { value: '#64748b' },
          600: { value: '#475569' },
          700: { value: '#334155' },
          800: { value: '#1e293b' },
          900: { value: '#0f172a' },
          950: { value: '#020617' },
        },
      },
      fonts: {
        heading: {
          value: `'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        },
        body: {
          value: `'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        },
      },
      radii: {
        l1: { value: '0.5rem' },
        l2: { value: '0.75rem' },
        l3: { value: '1.125rem' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: { _light: 'white', _dark: 'white' } },
          fg: {
            value: {
              _light: '{colors.brand.700}',
              _dark: '{colors.brand.300}',
            },
          },
          subtle: {
            value: { _light: '{colors.brand.50}', _dark: '{colors.brand.950}' },
          },
          muted: {
            value: {
              _light: '{colors.brand.100}',
              _dark: '{colors.brand.900}',
            },
          },
          emphasized: {
            value: {
              _light: '{colors.brand.200}',
              _dark: '{colors.brand.800}',
            },
          },
          solid: {
            value: {
              _light: '{colors.brand.600}',
              _dark: '{colors.brand.600}',
            },
          },
          focusRing: {
            value: {
              _light: '{colors.brand.600}',
              _dark: '{colors.brand.600}',
            },
          },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'gray.200',
      color: 'gray.900',
    },
  },
});

export const system = createSystem(defaultConfig, config);
