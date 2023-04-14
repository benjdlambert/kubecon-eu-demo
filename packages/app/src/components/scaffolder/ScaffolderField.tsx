import React, { PropsWithChildren, ReactElement } from 'react';

import { MarkdownContent } from '@backstage/core-components';
import { FormControl, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  markdownDescription: {
    fontSize: theme.typography.caption.fontSize,
    margin: 0,
    color: theme.palette.text.secondary,
    '& :first-child': {
      margin: 0,
      marginTop: '3px', // to keep the standard browser padding
    },
  },
}));

interface FieldProps {
  rawDescription?: string;
  errors?: ReactElement;
  rawErrors?: string[];
  help?: ReactElement;
  rawHelp?: string;
  required?: boolean;
  disabled: boolean;
  displayLabel?: boolean;
}

export const ScaffolderField = (props: PropsWithChildren<FieldProps>) => {
  const {
    children,
    displayLabel = true,
    rawErrors = [],
    errors,
    help,
    rawDescription,
    required,
    disabled,
  } = props;
  const classes = useStyles();
  return (
    <FormControl
      fullWidth
      error={rawErrors.length ? true : false}
      required={required}
      disabled={disabled}
    >
      {children}
      {displayLabel && rawDescription ? (
        <MarkdownContent
          content={rawDescription}
          className={classes.markdownDescription}
        />
      ) : null}
      {errors}
      {help}
    </FormControl>
  );
};
