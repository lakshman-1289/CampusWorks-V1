import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  InputAdornment
} from '@mui/material';
import { Controller } from 'react-hook-form';

const FormField = ({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  required = false,
  multiline = false,
  rows = 1,
  select = false,
  children,
  helperText,
  disabled = false,
  fullWidth = true,
  ...props
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth={fullWidth} error={!!error}>
            {select ? (
              <TextField
                {...field}
                select
                label={label}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                error={!!error}
                helperText={error?.message || helperText}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                        borderWidth: 2,
                      },
                    },
                    '&.Mui-error': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d32f2f',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(102, 126, 234, 0.3)',
                      borderWidth: 1,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '0.95rem',
                    '&.Mui-focused': {
                      color: '#667eea',
                      fontWeight: 700,
                    },
                    '&.MuiInputLabel-shrink': {
                      color: '#333',
                      fontWeight: 600,
                    },
                    '&.Mui-error': {
                      color: '#d32f2f',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: '#666',
                    marginTop: '4px',
                    '&.Mui-error': {
                      color: '#d32f2f',
                      fontWeight: 600,
                    },
                  },
                }}
                {...props}
              >
                {children}
              </TextField>
            ) : (
                              <TextField
                  {...field}
                  type={type}
                  label={label}
                  placeholder={placeholder}
                  required={required}
                  multiline={multiline}
                  rows={rows}
                  disabled={disabled}
                  error={!!error}
                  helperText={error?.message || helperText}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#667eea',
                          borderWidth: 2,
                        },
                      },
                      '&.Mui-error': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d32f2f',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        borderWidth: 1,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                      color: '#333',
                      fontSize: '0.95rem',
                      '&.Mui-focused': {
                        color: '#667eea',
                        fontWeight: 700,
                      },
                      '&.MuiInputLabel-shrink': {
                        color: '#333',
                        fontWeight: 600,
                      },
                      '&.Mui-error': {
                        color: '#d32f2f',
                      },
                    },
                  '& .MuiFormHelperText-root': {
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: '#666',
                    marginTop: '4px',
                    '&.Mui-error': {
                      color: '#d32f2f',
                      fontWeight: 600,
                    },
                  },
                  }}
                  {...props}
                />
            )}
          </FormControl>
        )}
      />
    </Box>
  );
};

export default FormField;
