import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomWebView from '../../../components/webView/CustomWebView';
import type { RootStackParamList } from '../../../navigation/Types';
import ScreenWrapper from '../../../components/common/ScreenWrapper';

type ForgotPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ route }) => {
  const [url] = useState(`${route.params.baseUrl}/ForgotPassword`);
  return (
    <ScreenWrapper title="Forgot Password">
      <CustomWebView initialUrl={url} />
    </ScreenWrapper>
  );
};

export default ForgotPasswordScreen;
