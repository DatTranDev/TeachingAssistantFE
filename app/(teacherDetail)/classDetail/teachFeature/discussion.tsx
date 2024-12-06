import React, { useState, useEffect, useRef, useContext } from "react";
import {
   View,
   Text,
   ScrollView,
   RefreshControl,
   TouchableOpacity,
   Image,
   KeyboardAvoidingView,
   TextInput,
   Modal,
   Linking,
   ActivityIndicator,
   Alert,
   Keyboard
} from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";

import { useNavigation, useIsFocused, useFocusEffect } from "@react-navigation/native";

import post from "@/utils/post";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/context/AuthContext";
import { SocketContext } from "@/context/SocketContext";
import get from "@/utils/get";
import Loading from "@/components/ui/Loading";
import Feather from "@expo/vector-icons/Feather";
import { Entypo, EvilIcons, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { localHost } from "@/utils/localhost";
import ButtonCustom from "@/components/ui/ButtonCustom";
import Post from "@/components/student/chat/post";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import * as ImagePicker from "expo-image-picker";
import mime from "react-native-mime-types";
import { formatNoWeekday } from "@/utils/formatDate";
import DiscussionPost from "@/components/student/chat/discussionPost";
import PostDiscussionTeacher from "@/components/teacher/postDiscussionTeacher";

export type Discussion = {
   cAttendId: string;
   title: string;
   content: string;
   images: string[];
   createdAt: string;
   id: string;
   creator: {
      name: string;
      userCode: string;
      role: string;
      avatar: string;
      id: string;
      email: string;
      school: string;
   };
   isResolved: boolean;
   reactions: Reaction[];
};
export type Reaction = {
   type: number;
   id: string;
   userId: {
      id: string;
      name: string;
      userCode: string;
      avatar: string;
   };
};
type FormatName = {
   id: string;
   number: number;
};
export default function Discussion() {
   const authContext = useContext(AuthContext);
   const socketContext = useContext(SocketContext);
   const router = useRouter();
   if (!authContext) {
      return;
   }
   const { user, accessToken } = authContext;
   const { cAttendId, sessionNumber, date, subjectId } = useLocalSearchParams();
   const scrollViewRef = useRef<ScrollView>(null);
   const [PostList, setPostList] = useState<Discussion[]>([]);
   const [isLoading, setLoading] = useState(true);
   const [isUploading, setUploading] = useState(false);
   const isFocused = useIsFocused();
   const [page, setPage] = useState(0);
   const [refreshing, setRefreshing] = useState(false);
   const [checkScroll, setcheckScroll] = useState(true);
   const [listFormat, setListFormat] = useState<FormatName[]>([]);

   const handleLoadMore = async () => {
      setPage(page + 1);
   };
   const onRefresh = () => {
      setRefreshing(true);
      handleLoadMore().then(() => setRefreshing(false));
   };
   useEffect(() => {
      setPage(0);
   }, [isFocused]);

   const formatTimePost = (time: Date) => {
      const hours = Math.floor(time.getHours());
      const minutes = Math.floor(time.getMinutes());
      const formattedMinutes = String(minutes).padStart(2, "0");
      let formattedHours = String(hours).padStart(2, "0");
      return `${time.getDate().toString().padStart(2, "0")}/${(time.getMonth() + 1)
         .toString()
         .padStart(2, "0")} ${formattedHours}:${formattedMinutes}`;
   };

   const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
         .toString()
         .padStart(2, "0")}/${date.getFullYear()}`;
      return formattedDate;
   };

   const renderPost = () => {
      const list: JSX.Element[] = [];
      const totalMessages = PostList.length;

      if (totalMessages === 0) {
         return (
            <Text
               className="text-blue_primary"
               style={{ marginHorizontal: "auto", marginVertical: "auto", fontSize: 18, marginTop: "80%" }}>
               Gửi bài tập nhóm tại đây !
            </Text>
         );
      }
      const start = totalMessages >= page * 4 + 10 ? totalMessages - (page * 4 + 10) : 0;
      let numberAnonymous = 0;
      for (let i = start; i < totalMessages; i++) {
         let sender = "";
         const currentPost = PostList[i];
         const time = new Date(currentPost.createdAt);
         let nameAnonymous = "";
         //ẩn danh
         const formatName = listFormat.find(item => item.id == currentPost.creator.id);
         if (formatName) {
            nameAnonymous = `Ẩn danh ${formatName.number}`;
         } else {
            numberAnonymous = numberAnonymous + 1;
            listFormat.push({ id: currentPost.creator.id, number: numberAnonymous });
            nameAnonymous = `Ẩn danh ${numberAnonymous}`;
         }

         // Hiển thị ngày nếu cần
         if (i > 0) {
            const previousPostTime = new Date(PostList[i - 1].createdAt);
            if (previousPostTime.getDate() !== time.getDate()) {
               list.push(
                  <Text
                     key={formatDateTime(currentPost.createdAt)}
                     className="bg-[#BBB3B3] rounded-[10px] py-[3px] max-w-[200px] font-semibold text-[10px] mt-5 mx-auto text-white px-[7px]">
                     {formatDateTime(currentPost.createdAt)}
                  </Text>
               );
            }
         }
         list.push(
            <PostDiscussionTeacher
               handleDeletePost={handleDeletePost}
               key={currentPost.id}
               Content={currentPost.content}
               Time={formatTimePost(time)}
               Creator={currentPost.creator}
               Title={currentPost.title}
               Id={currentPost.id}
               Images={currentPost.images}
               nameAnonymous={nameAnonymous}
               isResolved={currentPost.isResolved}
               reactions={currentPost.reactions}
               myId={user?.id || null}
            />
         );
      }

      return list;
   };

   const loadPost = async () => {
      setLoading(true);
      const url = `${localHost}/api/v1/discussion/findByCAttend/${cAttendId}?limit=1000&page=1`;
      const response = await get({ url: url, token: accessToken });
      if (response) {
         if (response.status == 200) {
            const list = await response.data;
            setPostList(list.discussions);
         } else {
            Alert.alert("Thông báo", "Đã xảy ra lỗi");
         }
      }
      setLoading(false);
   };
   const handleDeletePost = (Id: string) => {
      setPostList(prevList => prevList.filter(item => item.id != Id));
   };
   useEffect(() => {
      loadPost();
   }, []);
   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
         <View className="justify-center h-full flex-1 w-full relative">
            <View className=" shadow-md  pb-[1.5%] bg-blue_primary flex-row  pt-[12%] px-[4%] items-center ">
               <TouchableOpacity onPress={router.back}>
                  <Ionicons name="chevron-back-sharp" size={24} color="white" />
               </TouchableOpacity>
               <View className="mx-auto items-center pr-6">
                  <Text className="text-[18px] font-msemibold uppercase text-white">Câu hỏi</Text>
                  <Text className="mt-[-3px] text-white font-mmedium">{formatNoWeekday(date)}</Text>
               </View>
            </View>
            <LinearGradient
               style={{ height: 1.2, backgroundColor: "#F7F7F7" }}
               colors={["#C0BDBD", "#ffffff"]}></LinearGradient>

            {isLoading ? (
               <View
                  style={{
                     flex: 1,
                     justifyContent: "center",
                     alignItems: "center"
                  }}>
                  <ActivityIndicator size="large" color={colors.blue_primary} animating={true} />
               </View>
            ) : (
               <ScrollView
                  className="flex-1 w-full"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                     alignItems: "flex-end",
                     paddingVertical: 0,
                     paddingHorizontal: "0.5%"
                  }}
                  onContentSizeChange={(contentWidth, contentHeight) => {
                     if (checkScroll) {
                        scrollViewRef?.current?.scrollToEnd({ animated: true });
                        setcheckScroll(false);
                     }
                  }}
                  ref={scrollViewRef}
                  onScroll={({ nativeEvent }) => {
                     if (nativeEvent.contentOffset.y <= 0) {
                        handleLoadMore();
                     }
                  }}
                  scrollEventThrottle={16}
                  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                  {renderPost()}
                  <View className="h-8"></View>
               </ScrollView>
            )}

            <Loading loading={isUploading} />
         </View>
      </KeyboardAvoidingView>
   );
}
