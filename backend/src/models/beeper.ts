export interface Beeper {
  id: string;
  status: 'produced' | 'explosives_added' | 'shipped' | 'deployed' | 'detonated';
  lat?: number;
  lon?: number;
  productionDate: Date;
  deploymentDate?: Date;
}

export let beepers: Beeper[] = [];