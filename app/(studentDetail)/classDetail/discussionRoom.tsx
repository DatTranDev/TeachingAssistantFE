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
   };
   isResolved: boolean;
   reactions: Reaction[];
};
export type Reaction = {
   type: number;
   id: string;
   discussionId?: string|string[];
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
export default function DiscussionRoom() {
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
   const [visible, setVisible] = useState(false);
   const [titlePost, setTitlePost] = useState("");
   const [contentPost, setContentPost] = useState("");
   const [selectedImages, setSelectedImages] = useState<string[]>([]);
   const [numberName, setNumberName] = useState(0);
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

      if (totalMessages == 0) {
         return (
            <Text
               className="text-blue_primary"
               style={{ marginHorizontal: "auto", marginVertical: "auto", fontSize: 18, marginTop: "80%" }}>
               Đặt câu hỏi tại đây !
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
         sender = currentPost.creator.id === user?.id ? "My message" : "";
         // Xử lý ẩn danh
         if (!sender) {
            const formatName = listFormat.find(item => item.id === currentPost.creator.id);
            if (formatName) {
               nameAnonymous = `Ẩn danh ${formatName.number}`;
            } else {
               numberAnonymous = numberAnonymous + 1;
               nameAnonymous = `Ẩn danh ${numberAnonymous}`;
               listFormat.push({ id: currentPost.creator.id, number: numberAnonymous });
            }
         } else {
            nameAnonymous = `${currentPost.creator.name}- ${currentPost.creator.userCode}`;
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
            <DiscussionPost
               handleDeletePost={handleDeletePost}
               key={currentPost.id}
               Content={currentPost.content}
               Time={formatTimePost(time)}
               Creator={currentPost.creator}
               Title={currentPost.title}
               CAttendId={cAttendId}
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
   const sendPost = async (urlDownload: string[]) => {
      if (!contentPost) {
         return;
      }
      const dataPost = {
         cAttendId: `${cAttendId}`,
         creator: `${user?.id}`,
         title: `${titlePost}`,
         content: `${contentPost}`,
         images: urlDownload
      };
      let discussion: Discussion = {
         id: "",
         createdAt: `${new Date().toISOString()}`,
         cAttendId: `${cAttendId}`,
         creator: {
            name: `${user?.name}`,
            userCode: `${user?.userCode}`,
            role: `${user?.role}`,
            avatar: `${user?.avatar}`,
            id: `${user?.id}`
         },
         title: `${titlePost}`,
         content: `${contentPost}`,
         images: urlDownload,
         isResolved: false,
         reactions: []
      };

      if (user) {
         const url = `${localHost}/api/v1/discussion/add`;
         const response = await post({ url: url, data: dataPost, token: accessToken });
         if (response) {
            if (response.status == 201) {
               discussion.id = response.data.discussion.id;
               if(socketContext?.socket){
                  const dataMsg = {
                    title: `Câu hỏi mới`,//Tên môn học
                    body:  `${titlePost}`,//Nội dung tin nhắn
                    type: 'message',//Loại tin nhắn
                    senderId: user.id,//ID người gửi
                    sender: "Ẩn danh",//Tên người gửi
                    subject: `Câu hỏi mới`,//Tên môn học
                    room: ""//Phòng học
                  }
                  socketContext.socket.emit('sendMessageToSubject', {subjectID:cAttendId, message:discussion, dataMsg:dataMsg});
                }
               setPostList(prevList => [...prevList, discussion]);
               closeModal();
            } else {
               Alert.alert("Thông báo", "Không thể gửi");
            }
         }
      }
   };
   const uploadImage = async (imageUri: string) => {
      const formData = new FormData();
      const extension = imageUri.split(".").pop();
      if (extension) {
         const type = mime.lookup(extension);
         if (type) {
            formData.append("image", {
               uri: imageUri,
               type: type || "image/jpeg",
               name: `${Date.now()}.${extension}` // Mặc định là JPEG nếu không xác định được loại
            } as any);
         }
      }
      const url = `${localHost}/api/v1/upload/image`;
      const response = await post({ url: url, token: accessToken, data: formData });
      if (response) {
         if (response.status == 200) {
            const json = await response.data;
            return json.image;
         } else {
            return false;
         }
      }
      return false;

   };
   const handleAddDocument = async () => {
      if (selectedImages.length > 0) {
         setUploading(true);
         try {
            // Sử dụng Promise.all để đợi tất cả file upload xong
            const uploadPromises = selectedImages.map(item => uploadImage(item));
            const urlDownload = await Promise.all(uploadPromises);
            // Lọc ra các file upload thành công (có tên trả về)
            const uploaded = urlDownload.filter(url => url !== false) as string[];
            if (uploaded.length == selectedImages.length) {
               await sendPost(uploaded);
            } else {
               Alert.alert("Thông báo", "Có lỗi xảy ra");
            }
         } catch (error) {
            Alert.alert("Thông báo", "Có lỗi xảy ra");
         } finally {
            setUploading(false);
         }
      } else {
         await sendPost([]);
      }
   };
   const handleDeletePost = (Id: string) => {
      setPostList(prevList => prevList.filter(item => item.id != Id));
   };
   useEffect(() => {
      loadPost();
   }, []);
   //Connect to socket
  useEffect(() => {
  if (socketContext) {
    console.log('socket student: ', socketContext.socket.id);
    const { socket } = socketContext;
    if (socket) {
      socket.emit('joinSubject', { userID: user?.id,subjectID: cAttendId });
      socket.on('receiveSubjectMessage', (message: Discussion) => {
        if(message.creator.id!=user?.id)
          setPostList((prevList) => [...prevList, message]);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
      socket.on('receiveResolve', (messageID: string) => {
         setPostList((prevList) =>
           prevList.map((message) => {
             if (message.id === messageID) {
               return { ...message, isResolved: true };
             }
             return message;
           })
         );
       });
       socket.on('receiveDeleteMessage', (messageID: string) => {  
         setPostList((prevList) => prevList.filter((message) => message.id !== messageID));
       });
    }
  }
  return () => {
    if (socketContext) {
      const { socket } = socketContext;
      if (socket) {
        socket.emit('leaveSubject', { userID: user?.id,subjectID: cAttendId });
        socket.off('receiveSubjectMessage');
         socket.off('receiveResolve');
         socket.off('receiveDelete=Message');
      }
    }
  };
  }, [socketContext]);
   const closeModal = () => {
      setContentPost("");
      setTitlePost("");
      setSelectedImages([]);
      setVisible(false);
   };

   const pickImages = async () => {
      try {
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1
         });

         if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setSelectedImages([...selectedImages, ...newImages]);
         }
      } catch (error) {
         Alert.alert("Lỗi", "Không thể chọn ảnh");
      }
   };

   const removeImage = (index: number) => {
      const newImages = selectedImages.filter((_, i) => i !== index);
      setSelectedImages(newImages);
   };

   return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
         <Modal visible={visible} className="flex-1" transparent={true} animationType="fade">
            <View
               className="flex-1 justify-center items-center z-50 relative"
               style={{ backgroundColor: "rgba(170, 170, 170, 0.8)" }}>
               <TouchableOpacity onPress={closeModal} className="ml-auto mr-[3%] mt-[-8px] mb-1">
                  <FontAwesome name="close" size={28} color="red" />
               </TouchableOpacity>
               <View className="bg-white px-[8%] w-[90%]  pt-3 pb-4 rounded-lg shadow-lg">
                  <Text className="text-lg font-msemibold mb-4 mx-auto">Tạo câu hỏi</Text>
                  <Text className="text-base font-mmedium">Tiêu đề</Text>

                  <View className=" mt-3 py-2 px-3  border border-gray-300 rounded-md">
                     <TextInput
                        placeholder="Thắc mắc..."
                        value={titlePost}
                        onChangeText={e => setTitlePost(e)}
                        className="text-base leading-[22px]"
                     />
                  </View>
                  <Text className="text-base font-mmedium mt-3">Nội dung</Text>

                  <View className=" mt-3 py-2 px-3  border border-gray-300 rounded-md">
                     <TextInput
                        value={contentPost}
                        onChangeText={e => setContentPost(e)}
                        className="text-base leading-[22px] h-[100px]"
                        multiline={true}
                        textAlignVertical="top"
                        numberOfLines={5}
                     />
                  </View>
                  <View className="flex-row  mt-3 items-center">
                     <Text className="text-base font-mmedium">Ảnh</Text>
                     <TouchableOpacity onPress={pickImages} className="ml-1 mt-[2px]">
                        <Entypo name="plus" size={26} color={colors.blue_primary} />
                     </TouchableOpacity>
                  </View>
                  <View className="h-[180px] border border-gray-300 rounded-md px-1 mt-2">
                     <ScrollView className="max-h-[178px]">
                        <View className="h-1" />
                        <View className="flex-row flex-wrap">
                           {selectedImages.map((uri, index) => (
                              <View key={index} className="m-1 relative rounded-md border border-gray-200">
                                 <Image source={{ uri }} className="w-[80px] h-[80px] rounded-md " />
                                 <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className="absolute top-[-5] right-[-5] bg-white rounded-full p-1">
                                    <Feather name="x" size={15} color="red" />
                                 </TouchableOpacity>
                              </View>
                           ))}
                        </View>
                     </ScrollView>
                  </View>
                  <ButtonCustom handle={handleAddDocument} content="Đăng bài" otherStyle="mt-5 w-[60%]" />
               </View>
            </View>
         </Modal>

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
                  <View className="h-16"></View>
               </ScrollView>
            )}
            {/* bottom */}
            <View>
               <TouchableOpacity
                  onPress={() => setVisible(true)}
                  className="absolute bottom-3 right-4 bg-blue_primary flex-row py-[6px] px-3 items-center
              rounded-lg shadow-md">
                  <FontAwesome name="pencil-square-o" size={24} color="white" />
                  <Text className="text-white font-mmedium ml-2 text-base my-auto text-center">Đăng bài</Text>
               </TouchableOpacity>
            </View>
            <Loading loading={isUploading} />
         </View>
      </KeyboardAvoidingView>
   );
}
