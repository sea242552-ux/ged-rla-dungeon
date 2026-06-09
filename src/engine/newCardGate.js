import { NEW_CARD_GATE } from '../config/constants';
import { isDue } from './srs';

export function calculateNewCardsAllowed(wordStats) {
  let pressure = 0;
  for (const stat of Object.values(wordStats)) {
    if (stat.status === 'learning') pressure++;
    else if (stat.status === 'review' || stat.status === 'relearning') {
      if (isDue(stat)) pressure++;
    }
  }

  for (const rule of NEW_CARD_GATE) {
    if (pressure <= rule.maxPressure) return rule.newCards;
  }
  return 0;
}
