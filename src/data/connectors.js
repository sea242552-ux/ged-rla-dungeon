// คำเชื่อมแต่ละประเภท — Sea จะมาเติมรายการคำเองภายหลัง
// weight เริ่มต้น 1.0 ทุกคำ, ตอบถูก → ลด, ตอบผิด → เพิ่ม

export const CONNECTOR_TYPES = {
  cause_effect: {
    label: 'Cause & Effect',
    color: 'text-red-400',
    words: [
      { word: 'consequently', weight: 1.0, meaning: 'ดังนั้น / เป็นผลให้' },
      { word: 'therefore', weight: 1.0, meaning: 'ดังนั้น' },
      { word: 'hence', weight: 1.0, meaning: 'เพราะฉะนั้น' },
      { word: 'thus', weight: 1.0, meaning: 'ดังนั้น / ด้วยวิธีนี้' },
      { word: 'accordingly', weight: 1.0, meaning: 'ตามนั้น / ดังนั้น' },
      { word: 'as a result', weight: 1.0, meaning: 'เป็นผลให้' },
      { word: 'because', weight: 1.0, meaning: 'เพราะว่า' },
      { word: 'so', weight: 1.0, meaning: 'ดังนั้น' },
      { word: 'for this reason', weight: 1.0, meaning: 'ด้วยเหตุนี้' },
    ],
  },
  contrast: {
    label: 'Contrast & Opposition',
    color: 'text-blue-400',
    words: [
      { word: 'however', weight: 1.0, meaning: 'อย่างไรก็ตาม' },
      { word: 'conversely', weight: 1.0, meaning: 'ในทางกลับกัน' },
      { word: 'on the other hand', weight: 1.0, meaning: 'ในทางกลับกัน' },
      { word: 'whereas', weight: 1.0, meaning: 'ในขณะที่' },
      { word: 'on the contrary', weight: 1.0, meaning: 'ตรงกันข้าม' },
      { word: 'nevertheless', weight: 1.0, meaning: 'อย่างไรก็ตาม' },
      { word: 'nonetheless', weight: 1.0, meaning: 'อย่างไรก็ตาม' },
      { word: 'yet', weight: 1.0, meaning: 'แต่ถึงกระนั้น' },
      { word: 'still', weight: 1.0, meaning: 'แต่ก็ยังคง' },
    ],
  },
  addition: {
    label: 'Addition',
    color: 'text-green-400',
    words: [
      { word: 'furthermore', weight: 1.0, meaning: 'ยิ่งกว่านั้น' },
      { word: 'moreover', weight: 1.0, meaning: 'ยิ่งกว่านั้น' },
      { word: 'in addition', weight: 1.0, meaning: 'นอกจากนี้' },
      { word: 'further', weight: 1.0, meaning: 'นอกจากนี้' },
      { word: 'also', weight: 1.0, meaning: 'ด้วย / เช่นกัน' },
      { word: 'besides', weight: 1.0, meaning: 'นอกจากนี้' },
    ],
  },
  concession: {
    label: 'Concession',
    color: 'text-amber-400',
    words: [
      { word: 'although', weight: 1.0, meaning: 'แม้ว่า' },
      { word: 'even so', weight: 1.0, meaning: 'แม้กระนั้น' },
      { word: 'notwithstanding', weight: 1.0, meaning: 'ทั้งๆ ที่' },
      { word: 'granted', weight: 1.0, meaning: 'ยอมรับว่า' },
      { word: 'in spite of', weight: 1.0, meaning: 'ทั้งๆ ที่' },
      { word: 'despite', weight: 1.0, meaning: 'ถึงแม้ว่า' },
      { word: 'while', weight: 1.0, meaning: 'ในขณะที่' },
      { word: 'even though', weight: 1.0, meaning: 'แม้ว่า' },
    ],
  },
  condition: {
    label: 'Condition',
    color: 'text-purple-400',
    words: [
      { word: 'if', weight: 1.0, meaning: 'ถ้าหาก' },
      { word: 'unless', weight: 1.0, meaning: 'ยกเว้นว่า' },
      { word: 'provided that', weight: 1.0, meaning: 'โดยมีเงื่อนไขว่า' },
    ],
  },
  time_sequence: {
    label: 'Time & Sequence',
    color: 'text-cyan-400',
    words: [
      { word: 'subsequently', weight: 1.0, meaning: 'ต่อมา' },
      { word: 'meanwhile', weight: 1.0, meaning: 'ในขณะเดียวกัน' },
      { word: 'first', weight: 1.0, meaning: 'ประการแรก' },
      { word: 'then', weight: 1.0, meaning: 'จากนั้น' },
      { word: 'finally', weight: 1.0, meaning: 'ในที่สุด' },
      { word: 'afterward', weight: 1.0, meaning: 'หลังจากนั้น' },
    ],
  },
  comparison: {
    label: 'Comparison & Similarity',
    color: 'text-pink-400',
    words: [
      { word: 'likewise', weight: 1.0, meaning: 'ในทำนองเดียวกัน' },
      { word: 'similarly', weight: 1.0, meaning: 'เช่นเดียวกัน' },
      { word: 'in the same way', weight: 1.0, meaning: 'ในทำนองเดียวกัน' },
      { word: 'just as', weight: 1.0, meaning: 'เช่นเดียวกับ' },
    ],
  },
};

export const CONNECTOR_SENTENCES = [
  // === Cause & Effect ===
  { id: 'ce1', type: 'cause_effect', sentence: 'She studied every night; ___, she passed the exam with a high score.', answer_type: 'cause_effect' },
  { id: 'ce2', type: 'cause_effect', sentence: 'The bridge was damaged by the flood; ___, it was closed to traffic.', answer_type: 'cause_effect' },
  { id: 'ce3', type: 'cause_effect', sentence: 'He did not follow the instructions; ___, the machine broke down.', answer_type: 'cause_effect' },
  { id: 'ce4', type: 'cause_effect', sentence: 'The factory released toxic waste into the river; ___, many fish died.', answer_type: 'cause_effect' },
  { id: 'ce5', type: 'cause_effect', sentence: 'The team practiced daily for six months; ___, they won the championship.', answer_type: 'cause_effect' },
  { id: 'ce6', type: 'cause_effect', sentence: 'She missed the last bus; ___, she had to walk home in the rain.', answer_type: 'cause_effect' },
  { id: 'ce7', type: 'cause_effect', sentence: 'The company ignored safety regulations; ___, several workers were injured.', answer_type: 'cause_effect' },
  { id: 'ce8', type: 'cause_effect', sentence: 'Prices rose sharply last month; ___, many families struggled to afford food.', answer_type: 'cause_effect' },
  { id: 'ce9', type: 'cause_effect', sentence: 'He forgot to save his document; ___, all his work was lost.', answer_type: 'cause_effect' },
  { id: 'ce10', type: 'cause_effect', sentence: 'The drought destroyed the harvest; ___, food prices increased dramatically.', answer_type: 'cause_effect' },

  // === Contrast & Opposition ===
  { id: 'co1', type: 'contrast', sentence: 'She wanted to rest; ___, there was still too much work to finish.', answer_type: 'contrast' },
  { id: 'co2', type: 'contrast', sentence: '___ the weather was terrible, the event continued as planned.', answer_type: 'contrast' },
  { id: 'co3', type: 'contrast', sentence: 'He claims to support equality; ___, his actions suggest otherwise.', answer_type: 'contrast' },
  { id: 'co4', type: 'contrast', sentence: 'The first study found benefits; ___, the second found no significant change.', answer_type: 'contrast' },
  { id: 'co5', type: 'contrast', sentence: 'She loves crowded cities, ___ her sister prefers quiet rural areas.', answer_type: 'contrast' },
  { id: 'co6', type: 'contrast', sentence: 'The task was extremely difficult; ___, he refused to give up.', answer_type: 'contrast' },
  { id: 'co7', type: 'contrast', sentence: '___ she had little experience, she performed better than the veterans.', answer_type: 'contrast' },
  { id: 'co8', type: 'contrast', sentence: 'The plan seemed perfect on paper; ___, it failed in practice.', answer_type: 'contrast' },
  { id: 'co9', type: 'contrast', sentence: 'Many people supported the law; ___, a large group strongly opposed it.', answer_type: 'contrast' },
  { id: 'co10', type: 'contrast', sentence: 'He is very talkative at home, ___ he is completely silent in public.', answer_type: 'contrast' },

  // === Addition ===
  { id: 'ad1', type: 'addition', sentence: 'The new policy reduces costs; ___, it improves employee satisfaction.', answer_type: 'addition' },
  { id: 'ad2', type: 'addition', sentence: 'She speaks three languages; ___, she is an expert in data analysis.', answer_type: 'addition' },
  { id: 'ad3', type: 'addition', sentence: 'The restaurant offers great food; ___, the prices are very reasonable.', answer_type: 'addition' },
  { id: 'ad4', type: 'addition', sentence: 'He is highly qualified for the job; ___, he has years of relevant experience.', answer_type: 'addition' },
  { id: 'ad5', type: 'addition', sentence: 'The program teaches coding skills; ___, it helps students develop teamwork.', answer_type: 'addition' },
  { id: 'ad6', type: 'addition', sentence: 'Exercise improves physical health; ___, it boosts mental well-being.', answer_type: 'addition' },
  { id: 'ad7', type: 'addition', sentence: 'The city has excellent public transportation; ___, parking is very affordable.', answer_type: 'addition' },
  { id: 'ad8', type: 'addition', sentence: 'Reading improves vocabulary; ___, it strengthens critical thinking skills.', answer_type: 'addition' },
  { id: 'ad9', type: 'addition', sentence: 'The law protects workers from discrimination; ___, it ensures fair wages.', answer_type: 'addition' },
  { id: 'ad10', type: 'addition', sentence: 'She donated money to the charity; ___, she volunteered every weekend.', answer_type: 'addition' },

  // === Concession ===
  { id: 'cn1', type: 'concession', sentence: '___ the evidence was weak, the jury still found him guilty.', answer_type: 'concession' },
  { id: 'cn2', type: 'concession', sentence: '___ he worked hard, the results were disappointing.', answer_type: 'concession' },
  { id: 'cn3', type: 'concession', sentence: '___ mistakes were made, the project was ultimately successful.', answer_type: 'concession' },
  { id: 'cn4', type: 'concession', sentence: '___ the solution is imperfect, it is better than doing nothing.', answer_type: 'concession' },
  { id: 'cn5', type: 'concession', sentence: '___ her argument was flawed, it raised some important points.', answer_type: 'concession' },
  { id: 'cn6', type: 'concession', sentence: '___ the film received poor reviews, it became a box office hit.', answer_type: 'concession' },
  { id: 'cn7', type: 'concession', sentence: '___ progress has been slow, the team has not given up.', answer_type: 'concession' },
  { id: 'cn8', type: 'concession', sentence: '___ he disagreed with the decision, he respected it.', answer_type: 'concession' },
  { id: 'cn9', type: 'concession', sentence: '___ the road was dangerous, the driver continued without stopping.', answer_type: 'concession' },
  { id: 'cn10', type: 'concession', sentence: '___ the cost was high, the community agreed the project was necessary.', answer_type: 'concession' },

  // === Condition ===
  { id: 'cd1', type: 'condition', sentence: '___ you finish the report on time, we can submit it today.', answer_type: 'condition' },
  { id: 'cd2', type: 'condition', sentence: 'Do not leave the building ___ you hear the alarm.', answer_type: 'condition' },
  { id: 'cd3', type: 'condition', sentence: 'She locked the door ___ anyone could enter without permission.', answer_type: 'condition' },
  { id: 'cd4', type: 'condition', sentence: '___ the weather is good, the outdoor event will proceed as planned.', answer_type: 'condition' },
  { id: 'cd5', type: 'condition', sentence: 'You may borrow the book ___ you return it by Friday.', answer_type: 'condition' },
  { id: 'cd6', type: 'condition', sentence: 'Study consistently, ___ you risk falling behind the others.', answer_type: 'condition' },
  { id: 'cd7', type: 'condition', sentence: '___ you need help, do not hesitate to ask the teacher.', answer_type: 'condition' },
  { id: 'cd8', type: 'condition', sentence: 'He keeps a spare key ___ he loses the original.', answer_type: 'condition' },
  { id: 'cd9', type: 'condition', sentence: 'The contract is valid ___ both parties sign by the deadline.', answer_type: 'condition' },
  { id: 'cd10', type: 'condition', sentence: '___ all requirements are met, the application will be approved.', answer_type: 'condition' },

  // === Time & Sequence ===
  { id: 'ts1', type: 'time_sequence', sentence: 'He completed the first draft; ___, he asked a colleague to review it.', answer_type: 'time_sequence' },
  { id: 'ts2', type: 'time_sequence', sentence: '___, the team celebrated their hard-earned victory.', answer_type: 'time_sequence' },
  { id: 'ts3', type: 'time_sequence', sentence: 'She was a teacher; ___, she became the school principal.', answer_type: 'time_sequence' },
  { id: 'ts4', type: 'time_sequence', sentence: 'The two meetings were held ___; no one had time to rest.', answer_type: 'time_sequence' },
  { id: 'ts5', type: 'time_sequence', sentence: '___, the project had a much larger budget than it does now.', answer_type: 'time_sequence' },
  { id: 'ts6', type: 'time_sequence', sentence: 'First, gather all the materials; ___, begin assembling the parts.', answer_type: 'time_sequence' },
  { id: 'ts7', type: 'time_sequence', sentence: 'One team worked on the design; ___, another handled the technical setup.', answer_type: 'time_sequence' },
  { id: 'ts8', type: 'time_sequence', sentence: '___, the company announced its decision to close the factory.', answer_type: 'time_sequence' },
  { id: 'ts9', type: 'time_sequence', sentence: 'He graduated from university; ___, he found a job within two weeks.', answer_type: 'time_sequence' },
  { id: 'ts10', type: 'time_sequence', sentence: '___, I want to thank everyone who supported this project.', answer_type: 'time_sequence' },

  // === Comparison & Similarity ===
  { id: 'cm1', type: 'comparison', sentence: 'Hard work leads to success; ___, dedication brings long-term rewards.', answer_type: 'comparison' },
  { id: 'cm2', type: 'comparison', sentence: 'He treats every customer with respect; ___, his staff follows the same approach.', answer_type: 'comparison' },
  { id: 'cm3', type: 'comparison', sentence: 'The first report recommended more funding; ___, the second study reached the same conclusion.', answer_type: 'comparison' },
  { id: 'cm4', type: 'comparison', sentence: '___ athletes train their bodies daily, writers must practice their craft regularly.', answer_type: 'comparison' },
  { id: 'cm5', type: 'comparison', sentence: 'Reading improves empathy; ___, listening to diverse perspectives broadens understanding.', answer_type: 'comparison' },
  { id: 'cm6', type: 'comparison', sentence: 'She approached the problem calmly; ___, her partner remained composed under pressure.', answer_type: 'comparison' },
  { id: 'cm7', type: 'comparison', sentence: 'The new law protects workers; ___, the previous regulation had the same goal.', answer_type: 'comparison' },
  { id: 'cm8', type: 'comparison', sentence: '___ one study found a link between stress and illness, another confirmed the same relationship.', answer_type: 'comparison' },
  { id: 'cm9', type: 'comparison', sentence: 'Children learn through play; ___, adults often learn best through hands-on experience.', answer_type: 'comparison' },
  { id: 'cm10', type: 'comparison', sentence: 'The eastern team won through teamwork; ___, the western team relied on the same strategy.', answer_type: 'comparison' },
];
