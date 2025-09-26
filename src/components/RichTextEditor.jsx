import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box, Typography } from '@mui/material';

const RichTextEditor = ({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  height = 200,
  ...props 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          fontWeight: 600, 
          color: 'text.primary',
          fontSize: '0.875rem'
        }}
      >
        {label}
      </Typography>
      <Box 
        sx={{ 
          border: '1px solid #c4c4c4',
          borderRadius: '4px',
          overflow: 'hidden',
          '& .w-md-editor': {
            height: height + 40, // Add space for toolbar
          },
          '& .w-md-editor-text-container': {
            height: height,
          },
          '& .w-md-editor-text': {
            fontSize: '14px',
            lineHeight: '1.5',
          },
          '& .w-md-editor-text-pre': {
            fontSize: '14px',
            lineHeight: '1.5',
          }
        }}
      >
        <MDEditor
          value={value || ''}
          onChange={(val) => onChange(val || '')}
          placeholder={placeholder}
          preview="edit"
          hideToolbar={false}
          data-color-mode="light"
          {...props}
        />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
