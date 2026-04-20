import { savePublicVisualsContent } from './src/api/publicVisualsApi';
import { defaultPublicVisualsContent } from './src/data/publicVisualsContent';

async function updateVisuals() {
  try {
    console.log('업데이트 시작...');
    await savePublicVisualsContent(defaultPublicVisualsContent);
    console.log('디자인/비주얼 설정이 덮어씌워졌습니다!');
  } catch (err) {
    console.error('업데이트 실패:', err);
  }
}

updateVisuals();
