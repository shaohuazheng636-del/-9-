import { ShotDefinition } from './types';

export const SHOT_TYPES: ShotDefinition[] = [
  { id: 'medium', labelCN: '中景', labelEN: 'Medium Shot', valueCN: '中景镜头，展示人物上半身', valueEN: 'Medium Shot, showing upper body' },
  { id: 'close_up', labelCN: '特写', labelEN: 'Close-up', valueCN: '面部特写，展示细节表情', valueEN: 'Close-up shot, revealing facial details' },
  { id: 'extreme_close_up', labelCN: '大特写', labelEN: 'Extreme Close-up', valueCN: '大特写，眼部或微小细节', valueEN: 'Extreme Close-up, focusing on eyes or macro details' },
  { id: 'wide', labelCN: '全景', labelEN: 'Wide Shot', valueCN: '全景镜头，展示人物与环境', valueEN: 'Wide Shot, showing character within environment' },
  { id: 'extreme_wide', labelCN: '大远景', labelEN: 'Extreme Wide', valueCN: '极远全景，强调宏大场景', valueEN: 'Extreme Wide Shot, emphasizing vast landscape' },
  { id: 'low_angle', labelCN: '低角度', labelEN: 'Low Angle', valueCN: '低角度仰拍，展现威严感', valueEN: 'Low Angle shot, looking up' },
  { id: 'high_angle', labelCN: '高角度', labelEN: 'High Angle', valueCN: '高角度俯视', valueEN: 'High Angle shot, looking down' },
  { id: 'overhead', labelCN: '上帝视角', labelEN: 'Overhead', valueCN: '正上方垂直俯视', valueEN: 'Direct Overhead bird\'s-eye view' },
  { id: 'back', labelCN: '背面', labelEN: 'Back View', valueCN: '人物背面视角', valueEN: 'View from behind the character' },
  { id: 'ots', labelCN: '过肩', labelEN: 'OTS', valueCN: '过肩镜头', valueEN: 'Over-the-shoulder shot' },
  { id: 'dutch', labelCN: '荷兰角', labelEN: 'Dutch Angle', valueCN: '荷兰角倾斜构图', valueEN: 'Dutch Angle, tilted composition' },
  { id: 'action', labelCN: '动态', labelEN: 'Action', valueCN: '动态模糊动作捕捉', valueEN: 'Action shot with motion blur' },
];

export const DEFAULT_SHOT_ID = 'medium';

export const TEMPLATE_CN = {
  prefix: "根据",
  suffix: "，生成一张具有凝聚力的[3X3]网格图像，包含在统一环境中的9个不同摄像机镜头，严格保持人物/物体、服装和光线的一致性，8K分辨率，超逼真细节和质感。",
  shotPrefix: "镜头",
};

export const TEMPLATE_EN = {
  prefix: "Based on",
  suffix: ", generate a cohesive [3x3] grid image containing 9 different camera shots in a unified environment, strictly maintaining consistency of character/objects, clothing, and lighting, 8K resolution, hyper-realistic details and texture.",
  shotPrefix: "Shot",
};
