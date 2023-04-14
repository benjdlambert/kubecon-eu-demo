import {
  NextFieldExtensionComponentProps,
  createNextScaffolderFieldExtension,
} from '@backstage/plugin-scaffolder-react/alpha';
import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import React from 'react';
import { ScaffolderField } from './ScaffolderField';
import { Input, InputLabel } from '@material-ui/core';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

const Component = (props: NextFieldExtensionComponentProps<string>) => {
  const {
    schema: { title, description },
    formData,
    rawErrors,
    onChange,
    disabled,
    errors,
    required,
  } = props;

  return (
    <ScaffolderField
      rawErrors={rawErrors}
      rawDescription={description}
      disabled={disabled}
      errors={errors}
      required={required}
    >
      <InputLabel htmlFor={title}>{title}</InputLabel>
      <Input
        id={title}
        onChange={e => onChange(e.target?.value)}
        value={formData ?? ''}
      />
    </ScaffolderField>
  );
};

export const UniqueEntityPicker = scaffolderPlugin.provide(
  createNextScaffolderFieldExtension({
    name: 'UniqueEntityPicker',
    component: Component,
    validation: () => {},
  }),
);
