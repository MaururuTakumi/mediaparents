// ペルソナベースのインタビューシステム設定

export interface StudentWriterType {
  id: string
  name: string
  description: string
  characteristics: string[]
  strengths: string[]
  challenges: string[]
}

export interface ParentPersona {
  id: string
  name: string
  description: string
  childGrade: string
  academicSituation: string
  parentSituation: string
  unspokenWorries: string[]
  wantedInformation: string[]
}

export interface PersonaMatch {
  studentType: string
  parentPersona: string
  matchReason: string
  keyQuestions: string[]
  focusAreas: string[]
}

// 学生ライタータイプ定義
export const STUDENT_WRITER_TYPES: StudentWriterType[] = [
  {
    id: 'elite',
    name: 'A. エリートタイプ',
    description: '難関大学・有名企業内定・優秀な成績を誇る学生',
    characteristics: [
      '高い学力・能力を持つ',
      '競争環境に慣れている',
      '成功体験が豊富',
      '将来への明確なビジョンがある'
    ],
    strengths: [
      '具体的な成功ノウハウを提供できる',
      '高い目標設定の重要性を伝えられる',
      '効率的な学習方法を共有できる'
    ],
    challenges: [
      'プレッシャーの重さ',
      '完璧主義による精神的負担',
      '周囲からの期待の重さ'
    ]
  },
  {
    id: 'comeback',
    name: 'B. カムバックタイプ',
    description: '一度挫折や失敗を経験し、そこから立ち直った学生',
    characteristics: [
      '困難を乗り越えた経験がある',
      '失敗から学ぶ力がある',
      '精神的にタフ',
      '人の痛みを理解できる'
    ],
    strengths: [
      '挫折からの回復方法を伝えられる',
      '失敗への対処法を共有できる',
      '諦めない心の大切さを示せる'
    ],
    challenges: [
      '自信の回復過程での苦労',
      '周囲の目を気にする不安',
      '再チャレンジへの恐怖'
    ]
  },
  {
    id: 'rural',
    name: 'C. 地方・環境制約タイプ',
    description: '地方出身や経済的制約など、環境的な制約がある中で頑張っている学生',
    characteristics: [
      '限られた環境で努力している',
      '創意工夫する力がある',
      '家族への思いが強い',
      '謙虚で努力家'
    ],
    strengths: [
      '限られた環境での工夫を伝えられる',
      '家族への感謝の気持ちを表現できる',
      '地道な努力の価値を示せる'
    ],
    challenges: [
      '都市部との格差への焦り',
      '経済的な制約',
      '情報や機会の不足'
    ]
  },
  {
    id: 'parent_conflict',
    name: 'D. 親子関係葛藤タイプ',
    description: '親との価値観の違いや衝突を経験し、それを乗り越えつつある学生',
    characteristics: [
      '親との価値観の違いを体験',
      '自立への強い意志がある',
      '両方の立場を理解しようとする',
      '深く考える傾向がある'
    ],
    strengths: [
      '親子関係の改善方法を提案できる',
      '世代間の橋渡しができる',
      'コミュニケーションの大切さを伝えられる'
    ],
    challenges: [
      '親への複雑な感情',
      '自立と依存の間での葛藤',
      '理解してもらえない孤独感'
    ]
  },
  {
    id: 'self_paced',
    name: 'E. マイペースタイプ',
    description: '周囲に流されず、自分なりのペースで成長している学生',
    characteristics: [
      '自分らしさを大切にしている',
      '周囲に流されない強さがある',
      '独自の価値観を持つ',
      '多様性を認める'
    ],
    strengths: [
      '個性の大切さを伝えられる',
      '比較しない生き方を提案できる',
      '自分らしい成長の価値を示せる'
    ],
    challenges: [
      '周囲との温度差',
      '理解されにくい孤独感',
      '自分のペースへの不安'
    ]
  }
]

// 親ペルソナ定義
export const PARENT_PERSONAS: ParentPersona[] = [
  {
    id: 'anxious_mother_high_achiever',
    name: '成績優秀な子を持つ不安なお母さん',
    description: '子どもは優秀だが、プレッシャーを与えすぎていないか心配',
    childGrade: '高校生・大学生',
    academicSituation: '成績優秀・受験生',
    parentSituation: '教育熱心・期待が高い',
    unspokenWorries: [
      '子どもに過度なプレッシャーを与えていないか',
      '子どもが本当に幸せなのか',
      '完璧を求めすぎていないか',
      '子どもの本音を聞けているか'
    ],
    wantedInformation: [
      '優秀な子どもの本当の気持ち',
      'プレッシャーとの向き合い方',
      '親の期待と子どもの意志のバランス',
      '成功している子の親への感謝と不満'
    ]
  },
  {
    id: 'struggling_parent',
    name: '勉強に苦労する子を持つ親',
    description: '子どもの成績が振るわず、どうサポートすべきか悩んでいる',
    childGrade: '中学生・高校生',
    academicSituation: '成績低迷・やる気なし',
    parentSituation: '心配・焦り',
    unspokenWorries: [
      '子どもの将来が心配',
      'どう励ましていいかわからない',
      '他の子と比較してしまう',
      '子どもを追い詰めていないか'
    ],
    wantedInformation: [
      '挫折から立ち直った経験談',
      '親の声かけで効果的だったもの',
      'やる気を出すきっかけ',
      '失敗を恐れない心の育て方'
    ]
  },
  {
    id: 'communication_struggling_parent',
    name: 'コミュニケーションに悩む親',
    description: '思春期の子どもとの会話が減り、関係改善を模索している',
    childGrade: '中学生・高校生・大学生',
    academicSituation: '普通・反抗期',
    parentSituation: '困惑・寂しさ',
    unspokenWorries: [
      '子どもが何を考えているかわからない',
      '昔のように話してくれない',
      '間違った接し方をしていないか',
      '子どもに嫌われていないか'
    ],
    wantedInformation: [
      '子どもが親に求めている接し方',
      '効果的なコミュニケーション方法',
      '親子関係を修復した経験',
      '思春期の子どもの本音'
    ]
  },
  {
    id: 'career_worried_parent',
    name: '子どもの進路に不安を抱く親',
    description: '子どもの将来の職業や人生設計について心配している',
    childGrade: '高校生・大学生',
    academicSituation: '進路未定・就活中',
    parentSituation: '不安・口出ししたい',
    unspokenWorries: [
      '子どもが正しい進路を選べるか',
      'やりたいことが見つからない子どもへの対応',
      '安定した職に就いてほしい',
      '自分の価値観を押し付けていないか'
    ],
    wantedInformation: [
      '進路決定のプロセス',
      '親のサポートで助かったこと',
      '自分で道を見つけた経験',
      '将来への不安との向き合い方'
    ]
  },
  {
    id: 'distance_worried_parent',
    name: '遠方の子を持つ心配な親',
    description: '一人暮らしや遠方の学校に通う子どもを案じている',
    childGrade: '大学生・専門学生',
    academicSituation: '一人暮らし・遠方通学',
    parentSituation: '心配・寂しさ',
    unspokenWorries: [
      '子どもが一人で大丈夫か',
      '健康面や生活面は問題ないか',
      'ホームシックになっていないか',
      '適度な距離感がわからない'
    ],
    wantedInformation: [
      '一人暮らしの実際の体験',
      '親からの連絡で嬉しかったもの',
      'ホームシックの乗り越え方',
      '親への感謝の気持ち'
    ]
  }
]

// ペルソナマッチング定義
export const PERSONA_MATCHES: PersonaMatch[] = [
  {
    studentType: 'elite',
    parentPersona: 'anxious_mother_high_achiever',
    matchReason: '優秀な学生の実体験が、同様の状況の親に最も響く',
    keyQuestions: [
      '成績や結果にプレッシャーを感じた経験はありますか？',
      '親からの期待が重いと感じたことはありますか？',
      '完璧を求めすぎて辛くなった時期はありますか？',
      '親に「頑張らなくていい」と言ってもらいたかった瞬間はありますか？',
      '成功した今、親に一番感謝していることは何ですか？'
    ],
    focusAreas: [
      'プレッシャーへの対処法',
      '親の期待との向き合い方',
      '成功の裏にある苦労',
      '親への本音と感謝'
    ]
  },
  {
    studentType: 'comeback',
    parentPersona: 'struggling_parent',
    matchReason: '挫折から立ち直った経験が、同じ悩みを持つ親に希望を与える',
    keyQuestions: [
      'どん底の時期、親にどんな声をかけてもらいたかったですか？',
      '立ち直るきっかけになったものは何ですか？',
      '失敗した時、親の反応はどうでしたか？',
      '親に比較されて辛かった経験はありますか？',
      '今振り返って、あの挫折があって良かったと思いますか？'
    ],
    focusAreas: [
      '挫折時の親のサポート方法',
      '立ち直りのプロセス',
      '失敗への親の反応',
      '比較の悪影響と対策'
    ]
  },
  {
    studentType: 'parent_conflict',
    parentPersona: 'communication_struggling_parent',
    matchReason: '親子関係の改善経験が、コミュニケーションに悩む親の参考になる',
    keyQuestions: [
      '親と価値観が違うと感じたのはいつからですか？',
      '親とぶつかった時、本当は何を分かってほしかったですか？',
      '親子関係が改善されたきっかけは何でしたか？',
      '親からされて嬉しかった歩み寄りはありますか？',
      '今なら親の気持ちも理解できますか？'
    ],
    focusAreas: [
      '親子の価値観の違い',
      '効果的なコミュニケーション',
      '関係改善のプロセス',
      '相互理解への道筋'
    ]
  },
  {
    studentType: 'rural',
    parentPersona: 'distance_worried_parent',
    matchReason: '環境変化を乗り越えた経験が、遠方の子を心配する親に安心を与える',
    keyQuestions: [
      '故郷を離れた時、一番心配だったことは何ですか？',
      '親からの連絡で嬉しかったものはありますか？',
      'ホームシックになった時、どう乗り越えましたか？',
      '親に心配をかけないよう気を使っていましたか？',
      '今、親に一番感謝していることは何ですか？'
    ],
    focusAreas: [
      '環境変化への適応',
      '親との距離感',
      'ホームシックの対処',
      '親への感謝と心配'
    ]
  },
  {
    studentType: 'self_paced',
    parentPersona: 'career_worried_parent',
    matchReason: '自分らしい道を歩む経験が、進路に悩む親に新しい視点を提供',
    keyQuestions: [
      '自分なりの道を選んだ時、親はどう反応しましたか？',
      '周りと違う選択をする時、不安はありましたか？',
      '親に自分の価値観を理解してもらうために何をしましたか？',
      'マイペースな自分を親が心配していることは感じますか？',
      '自分らしく生きることの大切さを親に伝えるなら？'
    ],
    focusAreas: [
      '個性を活かした進路選択',
      '親の理解を得る方法',
      '自分らしさの価値',
      '多様な成功の形'
    ]
  }
]

// ペルソナマッチング関数
export function getRecommendedMatches(studentType: string): PersonaMatch[] {
  return PERSONA_MATCHES.filter(match => match.studentType === studentType)
}

export function getPersonaById(personas: ParentPersona[], id: string): ParentPersona | undefined {
  return personas.find(persona => persona.id === id)
}

export function getStudentTypeById(id: string): StudentWriterType | undefined {
  return STUDENT_WRITER_TYPES.find(type => type.id === id)
}