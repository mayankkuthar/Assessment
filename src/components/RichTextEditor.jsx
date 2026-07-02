import React from 'react';
import MDEditor from '@uiw/react-md-editor';

const RichTextEditor = ({ 
  value, 
  onChange, 
  label, 
  placeholder, 
  height = 200,
  ...props 
}) => {
  return (
    <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
      {label && <label className="form-label">{label}</label>}
      <div 
        className="editor-container"
        style={{ 
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}
      >
        <MDEditor
          value={value || ''}
          onChange={(val) => onChange(val || '')}
          placeholder={placeholder}
          preview="edit"
          hideToolbar={false}
          data-color-mode="light"
          height={height}
          {...props}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
