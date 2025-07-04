import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Pressable,
} from "react-native";
import { registerRootComponent } from "expo";
import { icons } from "@/constants/icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, Feather, Octicons } from "@expo/vector-icons";

import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import {
  useNavigation,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import { images } from "@/constants/image";
import { colors } from "@/constants/colors";
import { downloadImage } from "@/utils/downloadImage";
import { AuthContext } from "@/context/AuthContext";
import patch from "@/utils/patch";
import { localHost } from "@/utils/localhost";

type props = {
  Content: string;
  User: string;
  Avatar: string;
  Time: string;
  Type: string;
  Id: string;
  IsRecall: boolean;
  HandleRecall: (Id: string) => void;
};
export const MessageGroup = ({
  Content,
  User,
  Avatar,
  Time,
  Type,
  Id,
  IsRecall,
  HandleRecall,
}: props) => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    return;
  }
  const { user, accessToken } = authContext;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRecallVisible, setModalRecallVisible] = useState(false);
  const [urlModal, setUrlModal] = useState();

  let contentType = <View />;
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  const modalImage = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View
          className="relative p-0 m-0 w-full h-full"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <View className="flex-row absolute top-2 right-3 z-50">
            <TouchableOpacity
              className="ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
              onPress={() => downloadImage(Content)}
            >
              <Octicons name="download" size={23} color={colors.blue_primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
              onPress={closeModal}
            >
              <AntDesign name="close" size={23} color="red" />
            </TouchableOpacity>
          </View>
          <View className="w-full h-[85%] my-auto">
            <Image
              className="w-full h-full"
              source={{ uri: Content }}
              style={{ resizeMode: "contain" }}
            />
          </View>
        </View>
      </Modal>
    );
  };
  const reCall = async () => {
    const res = await patch({
      url: `${localHost}/api/v1/group/message/update/${Id}`,
      data: { isRevoked: true },
      token: accessToken,
    });
    if (res) {
      if (res.status == 200) {
        HandleRecall(Id);
        setModalRecallVisible(false);
      } else {
        Alert.alert("Thông báo", "Đã xả ra lỗi, không thể thu hồi tin nhắn !");
      }
    }
  };
  const modalRecall = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalRecallVisible}
        onRequestClose={() => setModalRecallVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => setModalRecallVisible(false)}
        >
          <View className="mt-2 bg-white  items-center p-2 rounded-xl">
            <TouchableOpacity onPress={reCall} className="items-center">
              <Feather name="trash" size={25} color="red" />
              <Text className="text-[16px] mt-1">Thu hồi</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  //Self-messages
  if (User == "My message") {
    if (IsRecall) {
      contentType = (
        <Text
          className="bg-blue_primary rounded-tl-[15px]
                 rounded-tr-[15px] rounded-bl-[15px] rounded-br-[2px] p-2.5 max-w-[200px] font-mregular 
                 text-[15px] mt-[4px] mr-[5px] text-gray-500"
        >
          Tin nhắn đã thu hồi
        </Text>
      );
    } else {
      switch (Type) {
        case "text":
          //     contentType = <Text style={styles.Message}> {Content}</Text>;
          contentType = (
            <Text
              className="bg-blue_primary rounded-tl-[15px]
                     rounded-tr-[15px] rounded-bl-[15px] rounded-br-[2px] p-2.5 max-w-[200px] font-mregular 
                     text-[15px] mt-[4px] mr-[5px] text-white"
            >
              {" "}
              {Content}
            </Text>
          );
          break;
        case "image":
          contentType = (
            <View style={{ marginTop: 3, marginRight: 5 }}>
              <Pressable
                className="w-[150px] h-[200px] overflow-hidden rounded-xl border border-blue_primary"
                onPress={openModal}
                onLongPress={() => setModalRecallVisible(true)}
              >
                <Image
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                  source={{ uri: Content }}
                />
              </Pressable>
            </View>
          );
          break;
      }
    }
    return (
      <Pressable
        className="mr-[2%]"
        onLongPress={() => setModalRecallVisible(true)}
      >
        {modalRecall()}
        {modalImage()}
        <View className="flex-row mt-0 w-[70%]">{contentType}</View>
        {Time != "" ? (
          <Text className="ml-0 mt-[1px] text-[12px]">{Time}</Text>
        ) : (
          <View />
        )}
      </Pressable>
    );
  }
  //not Self-messages
  else {
    if (IsRecall) {
      contentType = (
        <Text
          className="bg-[#D9D4D4] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[2px] rounded-br-[15px] p-2.5 
                  text-[15px] mt-[5px] ml-[5px] text-gray-500 font-mregular"
        >
          Tin nhắn đã thu hồi
        </Text>
      );
    } else {
      switch (Type) {
        case "text":
          contentType = (
            <Text
              className="bg-[#D9D4D4] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[2px] rounded-br-[15px] p-2.5 
                     font-mregular text-[15px] mt-[5px] ml-[5px]"
            >
              {" "}
              {Content}
            </Text>
          );
          break;
        case "image":
          contentType = (
            <View style={{ marginTop: 3, marginLeft: 5 }}>
              <Pressable
                style={{
                  width: 150,
                  height: 200,
                  overflow: "hidden",
                  borderRadius: 15,
                  borderColor: colors.blue_primary,
                  borderWidth: 1,
                }}
                onPress={openModal}
              >
                <Image
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                  source={{ uri: Content }}
                />
              </Pressable>
            </View>
          );
          break;
      }
    }
    return (
      <View className="mr-auto ml-[2%]">
        {modalImage()}
        <View className="flex-row mt-0 w-[60%]">
          <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">
            {Avatar != "no" && (
              <Image
                resizeMode="cover"
                source={
                  Avatar == "" || !Avatar
                    ? images.avatarDefault
                    : { uri: Avatar }
                }
                className="w-full h-full"
              />
            )}
          </View>
          {contentType}
        </View>
        {Time != "" ? (
          <Text className="ml-auto mt-[1px] text-[12px]">{Time}</Text>
        ) : (
          <View />
        )}
      </View>
    );
  }
};
