import { useSimulationStore } from '../store/useSimulationStore';
import { stepEntity } from '../fsm/stepEntity';
import { TABLE_FSM_CONFIG } from '../fsm/configs';
import { CLEAN_TABLE_MS } from '../utils/constants';

export function runTableSystem(delta: number): void {
  const { tables, updateTable } = useSimulationStore.getState();

  for (const table of tables) {
    switch (table.state) {
      case 'DIRTY': {
        // Auto-start cleaning (no separate cleaner entity — keeps it simple)
        updateTable(table.id, {
          state: stepEntity(TABLE_FSM_CONFIG, 'DIRTY', 'CLEANING'),
          cleanTimer: 0,
        });
        break;
      }

      case 'CLEANING': {
        const newTimer = table.cleanTimer + delta;
        if (newTimer >= CLEAN_TABLE_MS) {
          updateTable(table.id, {
            state: stepEntity(TABLE_FSM_CONFIG, 'CLEANING', 'AVAILABLE'),
            cleanTimer: 0,
          });
        } else {
          updateTable(table.id, { cleanTimer: newTimer });
        }
        break;
      }

      // AVAILABLE and OCCUPIED are driven by customerSystem — nothing to do here
      default:
        break;
    }
  }
}
