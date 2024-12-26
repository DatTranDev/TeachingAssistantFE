import { Alert } from "react-native";

import { Linking } from "react-native";

export const openLink = async (url:string) => {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url); // Mở liên kết
      } else {
        Alert.alert("Không thể mở liên kết");
      }
    }