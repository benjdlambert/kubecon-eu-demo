import React, { useState, useMemo } from 'react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  scaffolderApiRef,
  useCustomFieldExtensions,
  useTaskEventStream,
} from '@backstage/plugin-scaffolder-react';
import {
  DefaultTemplateOutputs,
  EmbeddableWorkflow,
  NextFieldExtensionOptions,
  TaskSteps,
} from '@backstage/plugin-scaffolder-react/alpha';
import { PropsWithChildren } from 'react';
import { JsonValue } from '@backstage/types';
import { useApi } from '@backstage/core-plugin-api';
import { Content, ErrorPanel } from '@backstage/core-components';
import { Box, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
});

const OngoingTaskComponent = (props: PropsWithChildren<{ taskId: string }>) => {
  const taskStream = useTaskEventStream(props.taskId);
  const steps = useMemo(
    () =>
      taskStream.task?.spec.steps.map(step => ({
        ...step,
        ...taskStream?.steps?.[step.id],
      })) ?? [],
    [taskStream],
  );
  const activeStep = useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].status !== 'open') {
        return i;
      }
    }

    return 0;
  }, [steps]);
  const classes = useStyles();
  return (
    <Content className={classes.contentWrapper}>
      {taskStream.error ? (
        <Box paddingBottom={2}>
          <ErrorPanel
            error={taskStream.error}
            title={taskStream.error.message}
          />
        </Box>
      ) : null}

      <Box paddingBottom={2}>
        <TaskSteps
          steps={steps}
          activeStep={activeStep}
          isComplete={taskStream.completed}
          isError={Boolean(taskStream.error)}
        />
      </Box>

      <DefaultTemplateOutputs output={taskStream.output} />
    </Content>
  );
};

export const TechdocsEmbeddableWorkflow = (props: PropsWithChildren<{}>) => {
  const { entity } = useEntity();
  const scaffolderApi = useApi(scaffolderApiRef);
  const extensions = useCustomFieldExtensions(
    props.children,
  ) as NextFieldExtensionOptions<unknown>[];
  const [taskId, setTaskId] = useState('');

  const onCreate = async (formData: Record<string, JsonValue>) => {
    const { taskId: returnedTask } = await scaffolderApi.scaffold({
      values: formData,
      templateRef: 'template:default/techdocs-template',
    });

    setTaskId(returnedTask);
  };

  if (taskId) {
    return <OngoingTaskComponent taskId={taskId} />;
  }

  return (
    <EmbeddableWorkflow
      title="Get started with Techdocs"
      description="Fill out the required fields to get setup with techdocs"
      namespace="default"
      templateName="techdocs-template"
      initialState={{
        entity: stringifyEntityRef(entity),
        site_name: entity.metadata.name,
        site_description: `${entity.metadata.name}'s documentation site`,
      }}
      onCreate={onCreate}
      onError={() => <div>Something went wrong</div>}
      extensions={extensions}
    />
  );
};
