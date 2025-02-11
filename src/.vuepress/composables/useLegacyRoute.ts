import { onMounted } from 'vue';
import { useRoute, withBase } from 'vuepress/client';
import { getDocVersion } from '../utils/index.js';

const useLegacyRoute = () => {
  const route = useRoute();
  onMounted(() => {
    let lang = 'zh';
    const allPath: string[] = route.path?.split('/');
    if (allPath && allPath.length > 2) {
      if ((allPath[0]==='' && allPath[1] === 'zh')||(allPath[0]==='zh')) {
        lang = 'zh';
      } else {
        lang = '';
      }
    }
    const version = getDocVersion(route.path, '');
    // 如果路径中包含 Tree 或 Table，并且当前页面内容为 404，则跳转到对应的 Quick Start 页面
    if (version==='latest' || version.includes('-Tree') || version.includes('-Table')) {
      if(document.getElementsByClassName('not-found-hint').length>0){ 
        // 替换 URL 中的 Tree 或 Table 之后的内容为 QuickStart/QuickStart.html
        
        window.location.href = `${window.location.origin}${withBase(lang+'/UserGuide/'+version+'/QuickStart/QuickStart.html')}`;
        //window.location.href = `${window.location.origin}/docs/zh/UserGuide/V2.0.1/${dialect}/QuickStart/QuickStart.html`;
    }
  }
  });
}

export default useLegacyRoute;
export { useLegacyRoute };