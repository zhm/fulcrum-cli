import { randomUUID } from 'crypto';
import Client from '../api/client';
import { blue } from './log';

export async function duplicateWorkflows(
  client: Client,
  sourceFormID: string,
  destinationFormID: string,
) {
  const workflows = await client.workflows.all({ form_id: sourceFormID });

  const filtered = workflows.objects.filter((w) => w.object_resource_id === sourceFormID);

  for (const workflow of filtered) {
    const idMap = {};

    for (const step of workflow.steps) {
      idMap[step.id] = randomUUID();
    }

    for (const step of workflow.steps) {
      step.id = idMap[step.id];
      step.next_steps = step.next_steps.map((nextStepId) => idMap[nextStepId]);
    }

    const newWorkflow = {
      ...workflow,
      id: null,
      object_resource_id: destinationFormID,
      active: false,
    };

    console.log('creating workflow', blue(newWorkflow.name));

    await client.workflows.create(newWorkflow);
  }
}

export async function deleteWorkflow(
  client: Client,
  id: string,
) {
  console.log('deleting workflow', blue(id));

  await client.workflows.delete(id);
}
