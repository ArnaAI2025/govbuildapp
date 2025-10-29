import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import { RootStackParamList } from '../../../navigation/Types';
import { COLORS } from '../../../theme/colors';
import NoData from '../../../components/common/NoData';
import Loader from '../../../components/common/Loader';
import HTMLView from 'react-native-htmlview';
import { imageSize, width, WINDOW_WIDTH } from '../../../utils/helper/dimensions';
import { FONT_FAMILY, FONT_SIZE } from '../../../theme/fonts';
import globalStyles from '../../../theme/globalStyles';

interface LicenseData {
  licenseFormat?: string;
  licenseCardViewFormat?: string;
  licenseCardBackViewFormat?: string;
}

interface ShowLicenseScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'ShowLicenseScreen'> {}

const ShowLicenseScreen: React.FC<ShowLicenseScreenProps> = ({ route }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [licenseData, setLicenseData] = useState<LicenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const data = route?.params?.caseDataById?.selectedType || [];
      setLicenseData(data);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [route?.params]);

  const license = licenseData[0];

  // const renderNode = useCallback(
  //   (node, index, siblings, parent, defaultRenderer) => {
  //     switch (node.name) {
  //       case "img":
  //         return (
  //           <View
  //             key={index}
  //             style={{ marginTop: 20, marginBottom: 20, alignItems: "center" }}
  //           >
  //             <Image
  //               style={[styles.img, { width: width(0.8) }]}
  //               source={{ uri: node.attribs.src?.replaceAll(" ", "") }}
  //               resizeMode="contain"
  //             />
  //           </View>
  //         );
  //       case "table":
  //         return (
  //           <ScrollView
  //             key={index}
  //             horizontal
  //             style={{
  //               marginTop: 10,
  //               borderWidth: node.attribs.border
  //                 ? Number(node.attribs.border)
  //                 : 1,
  //               borderColor: COLORS.GRAY_DARK,
  //               borderRadius: 4,
  //               marginBottom: 10,
  //             }}
  //           >
  //             <View>{defaultRenderer(node.children)}</View>
  //           </ScrollView>
  //         );
  //       case "tr":
  //         return (
  //           <View
  //             key={index}
  //             style={{
  //               flexDirection: "row",
  //               minHeight: 40, // more height for readability
  //               borderBottomWidth: 1,
  //               borderColor: COLORS.GRAY_LIGHT,
  //             }}
  //           >
  //             {defaultRenderer(node.children)}
  //           </View>
  //         );
  //       case "td":
  //         return (
  //           <View
  //             key={index}
  //             style={{
  //               minWidth: width(0.25),
  //               borderRightWidth: 1,
  //               borderColor: COLORS.GRAY_LIGHT,
  //               padding: 6,
  //               justifyContent: "center",
  //             }}
  //           >
  //             {defaultRenderer(node.children)}
  //           </View>
  //         );
  //     }
  //   },
  //   []
  // );

  const renderNodes = useCallback((node, index, siblings, parent, defaultRenderer) => {
    switch (node.name) {
      case 'img':
        return (
          <>
            <Text key={`${index}-spacer`}>{'\n'}</Text>
            <View key={`${index}-img`}>
              <Image
                style={styles.img}
                source={{ uri: node.attribs.src?.trim().replaceAll(' ', '') }}
                resizeMode="contain"
              />
            </View>
          </>
        );

      case 'table':
      case 'tr':
        return (
          <View key={index} style={{ width: width(1) }}>
            {defaultRenderer(node.children)}
          </View>
        );
      case 'td':
        return (
          <Text key={index} style={{ width: width(1) }}>
            {defaultRenderer(node.children)}
          </Text>
        );
    }
  }, []);

  const isEmptyHtml = (html) => {
    if (!html) return true;
    // Remove all HTML tags and whitespace
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length === 0;
  };

  const LicenseTab = () => {
    if (!license?.licenseFormat || isEmptyHtml(license.licenseFormat)) {
      return <NoData message="No show license available." containerStyle={styles.noData} />;
    }

    return (
      <ScrollView style={styles.content} horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={[globalStyles.cardContainer, { padding: 10 }]}>
          <HTMLView
            value={license.licenseFormat.replace(/\r?\n|\r/g, '')}
            renderNode={renderNodes}
          />
        </View>
      </ScrollView>
    );
  };

  const CardViewTab = () => {
    if (!license?.licenseCardViewFormat || !license?.licenseCardBackViewFormat) {
      return <NoData message="No license card view available." />;
    }

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.cardContainer}>
          <HTMLView
            value={license.licenseCardViewFormat.replace(/\r?\n|\r/g, '')}
            renderNode={renderNodes}
          />
        </View>
        <View style={[globalStyles.cardContainer, { marginTop: 20 }]}>
          <HTMLView
            value={license.licenseCardBackViewFormat.replace(/\r?\n|\r/g, '')}
            renderNode={renderNodes}
          />
        </View>
      </ScrollView>
    );
  };

  const renderScene = SceneMap({
    license: LicenseTab,
    card: CardViewTab,
  });

  return (
    <View style={styles.container}>
      <Loader loading={isLoading} />
      <ScreenWrapper title="License">
        <View style={styles.wrapper}>
          <TabView
            navigationState={{
              index,
              routes: [
                { key: 'license', title: 'License' },
                { key: 'card', title: 'License Card View' },
              ],
            }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={styles.indicator}
                style={styles.tabBar}
                labelStyle={styles.tabLabel}
                activeColor={COLORS.APP_COLOR}
                inactiveColor={COLORS.GRAY_HEADING}
              />
            )}
          />
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.5)' },
  wrapper: {
    flex: 1,
    paddingHorizontal: WINDOW_WIDTH * 0.025,
    // paddingTop: height(0.022),
    paddingBottom: 20,
    // borderTopLeftRadius: WINDOW_WIDTH * 0.09,
    // borderTopRightRadius: WINDOW_WIDTH * 0.09,
    backgroundColor: COLORS.WHITE,
  },
  img: { width: imageSize(0.5), height: imageSize(0.5) },
  content: { marginTop: 20, paddingBottom: 100 },
  indicator: {
    backgroundColor: COLORS.APP_COLOR,
    height: 3,
    borderRadius: 2,
  },
  tabBar: {
    backgroundColor: COLORS.WHITE,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  tabLabel: {
    fontSize: FONT_SIZE.Font_13,
    fontFamily: FONT_FAMILY.MontserratSemiBold,
    textTransform: 'none',
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    padding: 15,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10,
  },
});

export default ShowLicenseScreen;
