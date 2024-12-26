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
import { openLink } from "@/utils/openLink";
import { openFile } from "@/utils/openFile";


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

export default function Document({ }: Props) {
  const authContext = useContext(AuthContext);
  const socketContext = useContext(SocketContext);
  const router = useRouter();
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const { attendId, date, code } = useLocalSearchParams();
  const [isLoading, setLoading] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fileUpload, setFileUpload] = useState<FileUpload[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  async function fetchData() {
    setLoading(true);
    const res = await get({
      url: `${localHost}/api/v1/document/findByCAttend/${attendId}`,
      token: accessToken,
    });
    if (res && res.status == 200) {
      const documents = res.data.documents.map((item: any) => {
        let logo = "document";
        const extension = mime.extension(item.type);
        if (extension) {
          if (extension.includes("doc")) logo = "doc";
          if (extension.includes("pdf")) logo = "pdf";
          if (extension.includes("ppt")) logo = "ppt";
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
  const handleDeleteFile = (index: number) => {
    setFileUpload(fileUpload.filter((_, i) => i !== index));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };
  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const uploadFile = async (fileUri: string, name: string) => {
    //Loai bo ki tu dac biet
    const nameUpload = name.replace(/[()"',;:\\/?]/g, "");
    const formData = new FormData();
    const extension = fileUri.split(".").pop();
    if (extension) {
      const type = mime.lookup(extension);
      // console.log(fileUri)
      formData.append("file", {
        name: nameUpload,
        type: type,
        uri: fileUri,
      } as any);
      const url = `${localHost}/api/v1/upload/file?type=${type}&cAttendId=${attendId}&name=${name}`;
      const res = await post({ url: url, data: formData, token: accessToken });
      if (res && res.status == 200) {
        return name;
      }
    }
    return false;
  };
  const handleChooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/*",
        multiple: true,
      });
      if (result.assets) {
        // Tạo mảng mới chứa tất cả files
        const newFiles = result.assets.map((asset) => {
          const name = asset.name;
          const uri = asset.uri;
          const extension = uri.split(".").pop();

          let logo = "document";
          if (extension) {
            if (extension.includes("doc")) logo = "doc";
            if (extension.includes("pdf")) logo = "pdf";
            if (extension.includes("ppt")) logo = "ppt";
          }

          return {
            name,
            uri,
            extension: extension || "",
            logo,
          };
        });
        setFileUpload((prevFiles) => [...prevFiles, ...newFiles]);
      }
    } catch (error) {
      Alert.alert("Alert", "An error has occurred. Please try again later !");
    } finally {
      setUploading(false);
    }
  };
  const handleAddDocument = async () => {
    if (fileUpload.length > 0) {
      setUploading(true);
      try {
        // Sử dụng Promise.all để đợi tất cả file upload xong
        const uploadPromises = fileUpload.map((item) =>
          uploadFile(item.uri, item.name)
        );
        const uploadedNames = await Promise.all(uploadPromises);
        // Lọc ra các file upload thành công (có tên trả về)
        const uploaded = uploadedNames.filter(
          (name) => name !== false
        ) as string[];
        if (uploaded.length > 0) {
          const content = uploaded.join(", ");
          Alert.alert("Thông báo", `Tài liệu đã được tải lên: ${content}`);
          fetchData();
          handleCloseModal();
        } else {
          Alert.alert("Thông báo", "Tài liệu không được tải lên");
        }
      } catch (error) {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi tải tài liệu");
      } finally {
        setUploading(false);
      }
    }
  };
  const handleCloseModal = () => {
    setVisible(false);
    setFileUpload([]);
  };

  const handleLongPress = (doc: Document) => {
    Alert.alert(
      "Tùy chọn",
      `Bạn muốn làm gì với tài liệu "${doc.name}"?`,
      [
        {
          text: "Xóa tài liệu",
          style: "destructive",
          onPress: () => handleDeleteDocument(doc.id)
        },
        {
          text: "Hủy",
          style: "cancel"
        }
      ]
    );
  };
  const handleDeleteDocument = async (id: string) => {
    const res = await deleteApi({
      url: `${localHost}/api/v1/document/delete/${id}`,
      token: accessToken,
    });
    if (res && res.status == 200) {
      setDocuments(documents.filter((item) => item.id !== id));
      Alert.alert("Thông báo", "Tài liệu đã được xóa");
    }
  }

  const downloadFile = async (doc: Document) => {
    try {
      const filename = doc.name;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      // Kiểm tra file đã tồn tại chưa
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        // Nếu file đã tồn tại, hỏi người dùng có muốn tải lại không
        Alert.alert(
          "Thông báo",
          "Tài liệu đã tồn tại. Bạn có muốn tải lại không?",
          [
            {
              text: "Không",
              style: "cancel",
              onPress: async () => {
                // Mở file đã tồn tại
                // Sharing.shareAsync(fileUri);
                await openFile(fileUri,filename)
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
        setUploading(true);
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
          setUploading(false);
        }
      }

    } catch (error) {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải tài liệu');
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <Loading loading={isUploading} />
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
      <Modal
        visible={visible}
        className="flex-1"
        transparent={true}
        animationType="fade"
      >
        <View
          className="flex-1 justify-center items-center z-50 relative"
          style={{ backgroundColor: "rgba(170, 170, 170, 0.8)" }}
        >
          <TouchableOpacity
            onPress={handleCloseModal}
            className="ml-auto mr-[3%] mt-[-8px] mb-1"
          >
            <FontAwesome name="close" size={28} color="black" />
          </TouchableOpacity>
          <View className="bg-white px-[8%] w-[90%]  pt-3 pb-4 rounded-lg shadow-lg">
            <Text className="text-lg font-msemibold mx-auto">
              Thêm tài liệu
            </Text>
            <Text className="text-sm font-mmedium mb-4 mx-auto mt-[-5px]">
              {formatNoWeekday(date)}
            </Text>
            {/* <Text className='text-base font-mmedium'>Tiêu đề</Text>

            <View className='mt-3 py-2 px-3 rounded-md border border-gray-300'>
              <TextInput value={titlePost} onChangeText={(e) => setTitlePost(e)} className='text-base leading-[22px]' />
            </View> */}
            <View className="flex-row  mt-1 items-center">
              <Text className="text-base font-mmedium">Tài liệu</Text>
              <TouchableOpacity
                onPress={handleChooseFile}
                className="ml-1 mt-[2px]"
              >
                <Entypo name="plus" size={26} color={colors.blue_primary} />
              </TouchableOpacity>
            </View>
            <View className="h-[180px] border border-gray-300 rounded-md px-1 mt-2">
              <ScrollView className="max-h-[178px]">
                <View className="h-1" />
                {fileUpload.map((item, index) => (
                  <View key={index} className="flex-row items-center  mb-2">
                    <View className="flex-row items-center w-[92%] pr-9">
                      <Image
                        source={icons[item.logo as keyof typeof icons]}
                        className="w-8 h-8"
                      />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="font-msemibold ml-1"
                      >
                        {item.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className=""
                      onPress={() => handleDeleteFile(index)}
                    >
                      <Fontisto name="close-a" size={14} color="#ff4d4d" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            <ButtonCustom
              handle={handleAddDocument}
              content="Thêm"
              otherStyle="mt-5 w-[60%]"
            />
          </View>
        </View>
      </Modal>
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
            {documents.length > 0 ? documents.map((item, index) => (
              <Pressable
                key={index}
                onLongPress={() => handleLongPress(item)}
                className="w-[95%] flex-row items-center bg-white mx-auto px-3 py-3 mt-3 rounded-md shadow-lg">
                <View className="flex-row items-center pr-9 w-[85%]">
                  <Image
                    source={icons[item.logo as keyof typeof icons]}
                    className="w-9 h-9" />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="font-msemibold ml-1">
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity
                  className="ml-auto mr-1"
                  onPress={() => openLink(item.downloadUrl)}>
                  <AntDesign name="clouddownloado" size={28} color={colors.blue_primary} />
                </TouchableOpacity>
              </Pressable>
            )) : <Text className="text-center text-base font-mregular mt-[50%] text-blue_primary">Chưa có tài liệu nào được thêm</Text>}
            <View className="h-16"></View>
          </ScrollView>
        )}
        {/* bottom */}
        <View>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            className="absolute bottom-3 right-4 bg-blue_primary flex-row py-[6px] px-3 items-center
              rounded-lg shadow-md"
          >
            <FontAwesome name="pencil-square-o" size={24} color="white" />
            <Text className="text-white font-mmedium ml-2 text-base my-auto text-center">
              Thêm tài liệu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
