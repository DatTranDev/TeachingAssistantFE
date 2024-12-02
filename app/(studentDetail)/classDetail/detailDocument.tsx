import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import { View, Text } from "react-native";
import { SocketContext } from "@/context/SocketContext";
import { AuthContext } from "@/context/AuthContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import ButtonCustom from "@/components/ui/ButtonCustom";
import Entypo from "@expo/vector-icons/Entypo";
import mime from "react-native-mime-types";
import { formatNoWeekday } from "@/utils/formatDate";
import * as DocumentPicker from "expo-document-picker";
import { localHost } from "@/utils/localhost";
import post from "@/utils/post";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { icons } from "@/constants/icons";
import Loading from "@/components/ui/Loading";
import get from "@/utils/get";
import deleteApi from "@/utils/delete";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


type Props = {};
export type FileUpload = {
  name: string;
  uri: string;
  extension: string;
  logo: string;
};
export type Document = {
  id: string;
  name: string;
  downloadUrl: string;
  type: string;
  logo: string;
};

export default function DetailDocument({}: Props) {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter();
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const { attendId, date } = useLocalSearchParams();
  const [isLoading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  async function fetchData() {
    setLoading(true);
    console.log(accessToken);
    const res = await get({
      url: `${localHost}/api/v1/document/findByCAttend/6748b09109b6bf536f26c1b6`,
      token: accessToken,
    });
    if (res && res.status == 200) {
      const documents = res.data.documents.map((item: any) => {
        let logo = "document";
        if (item.type) {
          if (item.type.includes("doc")) logo = "doc";
          if (item.type.includes("pdf")) logo = "pdf";
          if (item.type.includes("ppt")) logo = "ppt";
        }
        return {
          id: item.id,
          name: item.name,
          downloadUrl: item.dowloadUrl,
          type: item.type,
          logo: logo,
        };
      });
      setDocuments(documents.reverse());
    } 
    else {
      Alert.alert("Thông báo", "Đã xảy ra lỗi");
    }
    setLoading(false);
  }
  const onRefresh = async () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };
  
  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const downloadFile = async (doc: Document) => {
    try {
     
      const filename = doc.name;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      console.log(fileUri);
      // Kiểm tra file đã tồn tại chưa
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log(fileInfo);
      if (fileInfo.exists) {
        // Nếu file đã tồn tại, hỏi người dùng có muốn tải lại không
        Alert.alert(
          "Thông báo",
          "Tài liệu đã tồn tại. Bạn có muốn tải lại không?",
          [
            {
              text: "Không",
              style: "cancel",
              onPress: () => {
                // Mở file đã tồn tại
                Sharing.shareAsync(fileUri);
              }
            },
            {
              text: "Có",
              onPress: async () => {
                await downloadNewFile();
              }
            }
          ]
        );
      } else {
        await downloadNewFile();
      }

      async function downloadNewFile() {
        setLoading(true);
        const downloadResumable = FileSystem.createDownloadResumable(
          doc.downloadUrl,
          fileUri,
          {}
        );

        try {
          const result = await downloadResumable.downloadAsync();
          if (result && result.uri) {
            await Sharing.shareAsync(result.uri);
          }
        } catch (e) {
          Alert.alert('Lỗi', 'Không thể tải tài liệu');
        } finally {
          setLoading(false);
        }
      }

    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải tài liệu');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <View className="mx-auto items-center pr-6">
          <Text className="text-[18px] font-msemibold uppercase text-white">
            Tài liệu
          </Text>
          <Text className="mt-[-3px] text-white font-mmedium">
            {formatNoWeekday(date)}
          </Text>
        </View>
      </View>
      <View className="flex-1 relative">
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator
              size="large"
              color={colors.blue_primary}
              animating={true}
            />
          </View>
        ) : (
          <ScrollView
            className="flex-1 w-full"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {documents.map((item, index) => (
              <View
                key={index} 
                className="w-[95%] flex-row items-center bg-white mx-auto px-3 py-3 mt-3 rounded-md shadow-lg">
                <View className="flex-row items-center pr-9">
                  <Image
                    source={icons[item.logo as keyof typeof icons]}
                    className="w-9 h-9"/>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail" 
                    className="font-msemibold ml-1">
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity 
                  className="ml-auto mr-1"
                  onPress={() => downloadFile(item)}>
                  <AntDesign name="clouddownloado" size={28} color={colors.blue_primary} />
                </TouchableOpacity>
              </View>
            ))}
            <View className="h-4"></View>
          </ScrollView>
        )}
        
      </View>
    </SafeAreaView>
  );
}
