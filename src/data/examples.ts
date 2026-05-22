import type { ScriptCommand } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface Example {
  name: string;
  description: string;
  commands: ScriptCommand[];
}

export const EXAMPLES: Example[] = [
  {
    name: 'Bulk Assign Compounds',
    description: 'Assign all compounds currently on CP0001 that end in "003" to CP0002.',
    commands: [
      { id: uuidv4(), type: 'LogMessage', attributes: { Message: 'Assigning compounds from CP0001 to CP0002' } },
      { id: uuidv4(), type: 'QueryFilter', attributes: { Filter: 'Filter1', Condition: 'BasedOn', Value: '$COMPND' } },
      { id: uuidv4(), type: 'QueryFilter', attributes: { Filter: 'Filter1', Condition: 'NamedLike', Value: '%003' } },
      { id: uuidv4(), type: 'QueryFilter', attributes: { Filter: 'Filter1', Condition: 'AssignedTo', Value: 'CP0001' } },
      { id: uuidv4(), type: 'AssignCompound', attributes: { Filter: 'Filter1', Controller: 'CP0002' } },
    ],
  },
  {
    name: 'Create Strategy with Blocks',
    description: 'Create a compound, strategy, and two blocks with a connection.',
    commands: [
      { id: uuidv4(), type: 'CreateCompound', attributes: { Template: '$COMPND', Compound: 'COMPND_001', Controller: 'CP2801' } },
      { id: uuidv4(), type: 'CreateStrategy', attributes: { Template: '$Strategy', Strategy: 'MyStrategy1', Compound: 'COMPND_001' } },
      { id: uuidv4(), type: 'CreateBlock', attributes: { Template: '$AIN', Block: 'MY_AIN', Strategy: 'COMPND_001.MyStrategy1' } },
      { id: uuidv4(), type: 'CreateBlock', attributes: { Template: '$PIDA', Block: 'MY_PIDA', Strategy: 'COMPND_001.MyStrategy1' } },
      { id: uuidv4(), type: 'CreateBlockAddressCxn', attributes: { Strategy: 'COMPND_001.MyStrategy1', Sink: 'MY_PIDA', SinkParm: 'MEAS', SinkValue: 'MY_AIN.PNT' } },
    ],
  },
  {
    name: 'Loop — Create 10 Strategies',
    description: 'Use PerformOperation to create 10 uniquely-named strategies in a compound.',
    commands: [
      { id: uuidv4(), type: 'CreateCompound', attributes: { Template: '$COMPND', Compound: 'MyCompound', Controller: 'CP2801' } },
      {
        id: uuidv4(),
        type: 'PerformOperation',
        attributes: { StartCount: '1', EndCount: '10', Increment: '1' },
        children: [
          { id: uuidv4(), type: 'CreateStrategy', attributes: { Template: '$Strategy', Strategy: 'MyStrategy^', Compound: 'MyCompound' } },
        ],
      },
    ],
  },
  {
    name: 'Update AIN Block Attributes',
    description: 'Update HSCO1 on all $AIN blocks in strategies derived from $Strategy in MY_COMPND.',
    commands: [
      { id: uuidv4(), type: 'QueryFilter', attributes: { Filter: 'Filter1', Condition: 'DerivedOrInstantiatedFrom', Value: '$Strategy' } },
      { id: uuidv4(), type: 'QueryFilter', attributes: { Filter: 'Filter1', Condition: 'ContainedBy', Value: 'MY_COMPND' } },
      { id: uuidv4(), type: 'BlockQueryFilter', attributes: { Filter: 'Filter1', Condition: 'DerivedOrInstantiatedFrom', Value: '$AIN' } },
      { id: uuidv4(), type: 'UpdateBlockAttribute', attributes: { Filter: 'Filter1', ParmName: 'HSCO1', ParmValue: '105.3' } },
    ],
  },
  {
    name: 'Deploy Controller',
    description: 'Back up the Galaxy, then deploy a controller.',
    commands: [
      { id: uuidv4(), type: 'BackupGalaxy', attributes: { Name: 'PreDeploy_Backup.cab' } },
      { id: uuidv4(), type: 'LogMessage', attributes: { Message: 'Deploying controller CP2801' } },
      { id: uuidv4(), type: 'DeployController', attributes: { Controller: 'CP2801' } },
    ],
  },
  {
    name: 'Variable Substitution',
    description: 'Use SetVar to parameterize a script.',
    commands: [
      { id: uuidv4(), type: 'SetVar', attributes: { Variable: 'CP', Value: 'CP2801' } },
      { id: uuidv4(), type: 'SetVar', attributes: { Variable: 'TMPL', Value: '$COMPND' } },
      { id: uuidv4(), type: 'CreateCompound', attributes: { Template: '%TMPL%', Compound: 'MY_COMPND', Controller: '%CP%' } },
      { id: uuidv4(), type: 'DeployCompound', attributes: { Compound: 'MY_COMPND' } },
    ],
  },
];
