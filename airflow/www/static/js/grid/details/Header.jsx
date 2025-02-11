/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { MdPlayArrow } from 'react-icons/md';

import { getMetaValue } from '../../utils';
import useSelection from '../utils/useSelection';
import Time from '../components/Time';
import { useTasks, useGridData } from '../api';

const dagId = getMetaValue('dag_id');

const LabelValue = ({ label, value }) => (
  <Box position="relative">
    <Heading as="h5" size="sm" color="gray.300" position="absolute" top="-12px">{label}</Heading>
    <Heading as="h3" size="md">{value}</Heading>
  </Box>
);

const Header = () => {
  const { data: { dagRuns } } = useGridData();
  const { selected: { taskId, runId }, onSelect, clearSelection } = useSelection();
  const { data: { tasks } } = useTasks();
  const dagRun = dagRuns.find((r) => r.runId === runId);
  const task = tasks.find((t) => t.taskId === taskId);

  // clearSelection if the current selected dagRun is
  // filtered out.
  useEffect(() => {
    if (runId && !dagRun) {
      clearSelection();
    }
  }, [clearSelection, dagRun, runId]);

  let runLabel;
  if (dagRun) {
    if (runId.includes('manual__') || runId.includes('scheduled__') || runId.includes('backfill__')) {
      runLabel = (<Time dateTime={dagRun.dataIntervalStart || dagRun.executionDate} />);
    } else {
      runLabel = runId;
    }
    if (dagRun.runType === 'manual') {
      runLabel = (
        <>
          <MdPlayArrow style={{ display: 'inline' }} />
          {runLabel}
        </>
      );
    }
  }

  const isMapped = task && task.isMapped;
  const lastIndex = taskId ? taskId.lastIndexOf('.') : null;
  const taskName = lastIndex ? taskId.substring(lastIndex + 1) : taskId;

  const isDagDetails = !runId && !taskId;
  const isRunDetails = runId && !taskId;
  const isTaskDetails = runId && taskId;

  return (
    <Breadcrumb mt={4} separator={<Text color="gray.300">/</Text>}>
      <BreadcrumbItem isCurrentPage={isDagDetails}>
        <BreadcrumbLink onClick={clearSelection} _hover={isDagDetails ? { cursor: 'default' } : undefined}>
          <LabelValue label="DAG" value={dagId} />
        </BreadcrumbLink>
      </BreadcrumbItem>
      {runId && (
        <BreadcrumbItem isCurrentPage={isRunDetails}>
          <BreadcrumbLink onClick={() => onSelect({ runId })} _hover={isRunDetails ? { cursor: 'default' } : undefined}>
            <LabelValue label="Run" value={runLabel} />
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
      {taskId && (
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink _hover={isTaskDetails ? { cursor: 'default' } : undefined}>
            <LabelValue label="Task" value={`${taskName}${isMapped ? ' []' : ''}`} />
          </BreadcrumbLink>
        </BreadcrumbItem>
      )}
    </Breadcrumb>
  );
};

export default Header;
