// Shared react-select styling to match the Chakra theme, since react-select
// isn't a Chakra component and can't read theme tokens directly.
export const brandSelectStyles = (isInvalid?: boolean) => ({
  container: (base: any) => ({ ...base, width: '100%' }),
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 40,
    borderRadius: 6,
    borderColor: isInvalid ? '#e53e3e' : state.isFocused ? '#4f46e5' : '#cbd5e1',
    boxShadow: state.isFocused
      ? `0 0 0 1px ${isInvalid ? '#e53e3e' : '#4f46e5'}`
      : 'none',
    '&:hover': {
      borderColor: isInvalid ? '#e53e3e' : '#94a3b8',
    },
  }),
  placeholder: (base: any) => ({ ...base, color: '#94a3b8' }),
  singleValue: (base: any) => ({ ...base, color: '#0f172a' }),
  menu: (base: any) => ({
    ...base,
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
    zIndex: 20,
    overflow: 'hidden',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#4f46e5'
      : state.isFocused
      ? '#eef2ff'
      : 'white',
    color: state.isSelected ? 'white' : '#0f172a',
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: '#e0e7ff',
    borderRadius: 4,
  }),
  multiValueLabel: (base: any) => ({ ...base, color: '#3730a3' }),
});
