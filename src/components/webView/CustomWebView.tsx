import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Loader from '../common/Loader';
import type { CustomWebViewProps } from '../../utils/interfaces/IComponent';
import { WINDOW_WIDTH } from '../../utils/helper/dimensions';
import { COLORS } from '../../theme/colors';

const appendHideHeaderParam = (url: string) => {
  if (url.includes('HideHeaderAndFooter=true')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}HideHeaderAndFooter=true`;
};

const CustomWebView: React.FC<CustomWebViewProps> = ({ initialUrl }) => {
  const [url] = useState(() => appendHideHeaderParam(initialUrl));
  const [loading, setLoading] = useState(true);

  // CSS injected before content loads to hide headers/footers
  const injectedCSS = `
    (function() {
      const css = \`
        header, .header, #header,
        footer, .footer, #footer,
        .main-header, #top-header, .site-header,
        #mainNav, .navbar, .navbar-dark, .fixed-top,
        .alertBar, .uiiw, .ui_w,
        .uai, .userway_dark, #userwayAccessibilityIcon {
          display: none !important;
        }
      \`;
      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
    })();
    true;
  `;

  // JS injected after page load to hide dynamic elements & track interactions
  const injectedJavaScript = `
    (function() {
      const hideElements = () => {
        const selectors = [
          'header', '.header', '#header',
          'footer', '.footer', '#footer',
          '.main-header', '#top-header', '.site-header',
          '#mainNav', '.navbar', '.navbar-dark', '.fixed-top',
          '.alertBar', '.uiiw', '.ui_w',
          '.uai', '.userway_dark', '#userwayAccessibilityIcon'
        ];

        selectors.forEach(sel => {
          const elements = document.querySelectorAll(sel);
          elements.forEach(el => {
            el.style.display = 'none';
          });
        });
      };

      hideElements();

      const observer = new MutationObserver(() => {
        hideElements();
      });

      observer.observe(document.body, { childList: true, subtree: true });

      window.ReactNativeWebView.postMessage("Mutation observer set");

      // Track button or link clicks
      document.addEventListener("click", function(event) {
        const tag = event.target.tagName.toLowerCase();
        if (
          tag === "button" ||
          tag === "a" ||
          event.target.closest("button") ||
          event.target.closest("a")
        ) {
          window.ReactNativeWebView.postMessage("start-loading");

          // Fallback in case no new page load happens
          setTimeout(() => {
            window.ReactNativeWebView.postMessage("stop-loading");
          }, 3000);
        }
      }, true);
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      {loading && <View style={styles.overlay} />}
      <WebView
        source={{ uri: url }}
        onLoadEnd={() => setTimeout(() => setLoading(false), 500)}
        onError={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScriptBeforeContentLoaded={injectedCSS}
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => {
          const message = event.nativeEvent.data;
          console.log('WebView message:---->>>', message);
          if (message === 'start-loading') {
            setLoading(true);
          } else if (message === 'stop-loading') {
            setLoading(false);
          }
        }}
        onNavigationStateChange={() => {
          setLoading(true); // trigger native loader for internal navigation
        }}
        javaScriptCanOpenWindowsAutomatically={false}
        showsVerticalScrollIndicator={false}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: WINDOW_WIDTH * 0.025,
  },
  webview: {
    flex: 1,
    marginTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },
});

export default CustomWebView;
