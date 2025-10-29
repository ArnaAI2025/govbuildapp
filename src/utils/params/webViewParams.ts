import { URL } from '../../constants/url';
import { WebViewUrlParams } from '../interfaces/IComponent';

export const constructWebViewUrl = ({ baseUrl, path }: WebViewUrlParams): string => {
  const webUrl = URL.WEB_URL; // Replace with actual WEBURL constant or import
  const endPoint = path.includes('?')
    ? '&HideHeaderAndFooter=true&hideLeftMenu=true'
    : '?HideHeaderAndFooter=true&hideLeftMenu=true';
  return `${baseUrl}${webUrl}HideHeaderAndFooter=true&hideLeftMenu=true&returnUrl=${path}${endPoint}`;
};
