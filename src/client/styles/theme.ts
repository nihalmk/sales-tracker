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

const config = defineConfig({
  theme: {
    slotRecipes: {
      table: tableSlotRecipe,
    },
    tokens: {
      colors: {
        brand: {
          50: { value: '#eef2ff' },
          100: { value: '#e0e7ff' },
          200: { value: '#c7d2fe' },
          300: { value: '#a5b4fc' },
          400: { value: '#818cf8' },
          500: { value: '#6366f1' },
          600: { value: '#4f46e5' },
          700: { value: '#4338ca' },
          800: { value: '#3730a3' },
          900: { value: '#312e81' },
          950: { value: '#1e1b4b' },
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
        heading: { value: `'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
        body: { value: `'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
      },
      radii: {
        l1: { value: '0.375rem' },
        l2: { value: '0.5rem' },
        l3: { value: '0.75rem' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: { _light: 'white', _dark: 'white' } },
          fg: { value: { _light: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
          subtle: { value: { _light: '{colors.brand.50}', _dark: '{colors.brand.950}' } },
          muted: { value: { _light: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
          emphasized: { value: { _light: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
          solid: { value: { _light: '{colors.brand.600}', _dark: '{colors.brand.600}' } },
          focusRing: { value: { _light: '{colors.brand.600}', _dark: '{colors.brand.600}' } },
        },
      },
    },
  },
  globalCss: {
    body: {
      bg: 'gray.50',
      color: 'gray.900',
    },
  },
});

export const system = createSystem(defaultConfig, config);
