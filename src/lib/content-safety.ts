/**
 * Content Safety Layer
 * Detects sensitive content and appends appropriate disclaimers
 */

const SELF_HARM_KEYWORDS = [
  '自杀', '自残', '自伤', '不想活', '活不下去', '结束生命',
  '跳楼', '割腕', '服药过量', '死了算了', '去死',
];

const MEDICAL_KEYWORDS = [
  '抑郁症', '焦虑症', '双相', '精神分裂', '药物', '服药',
  '治疗方案', '诊断', '就医', '手术', '癌症', '疾病',
];

const LEGAL_KEYWORDS = [
  '起诉', '官司', '打官司', '判刑', '坐牢', '法律诉讼',
  '赔偿', '离婚诉讼', '合同纠纷',
];

const FINANCIAL_KEYWORDS = [
  '投资', '炒股', '基金', '理财', '借贷', '贷款',
  '比特币', '加密货币', '期货', '杠杆',
];

export interface SafetyCheckResult {
  isSafe: boolean;
  hasSelfHarm: boolean;
  hasMedical: boolean;
  hasLegal: boolean;
  hasFinancial: boolean;
  disclaimers: string[];
}

export function checkContentSafety(question: string): SafetyCheckResult {
  const result: SafetyCheckResult = {
    isSafe: true,
    hasSelfHarm: false,
    hasMedical: false,
    hasLegal: false,
    hasFinancial: false,
    disclaimers: [],
  };

  const q = question.toLowerCase();

  // Self-harm check (highest priority)
  if (SELF_HARM_KEYWORDS.some(kw => q.includes(kw))) {
    result.hasSelfHarm = true;
    result.isSafe = false;
    result.disclaimers.push(
      '💛 如果你正在经历痛苦或有伤害自己的想法，请立即寻求专业帮助：\n' +
      '• 24小时心理援助热线：400-161-9995\n' +
      '• 北京心理危机研究与干预中心：010-82951332\n' +
      '• 生命热线：400-821-1215\n' +
      '你值得被关心和帮助，请一定要向身边的人求助。'
    );
  }

  // Medical check
  if (MEDICAL_KEYWORDS.some(kw => q.includes(kw))) {
    result.hasMedical = true;
    result.disclaimers.push(
      '⚕️ 塔罗解读不能替代专业医疗建议。如涉及身心健康问题，请咨询专业医疗人员。'
    );
  }

  // Legal check
  if (LEGAL_KEYWORDS.some(kw => q.includes(kw))) {
    result.hasLegal = true;
    result.disclaimers.push(
      '⚖️ 塔罗解读不构成法律建议。如涉及法律事务，请咨询专业律师。'
    );
  }

  // Financial check
  if (FINANCIAL_KEYWORDS.some(kw => q.includes(kw))) {
    result.hasFinancial = true;
    result.disclaimers.push(
      '💰 塔罗解读不构成投资建议。如涉及财务决策，请咨询专业理财顾问。'
    );
  }

  return result;
}

/**
 * Append safety disclaimers to reading result
 */
export function appendDisclaimers(readingText: string, disclaimers: string[]): string {
  if (disclaimers.length === 0) return readingText;
  return readingText + '\n\n---\n\n' + disclaimers.join('\n\n');
}
