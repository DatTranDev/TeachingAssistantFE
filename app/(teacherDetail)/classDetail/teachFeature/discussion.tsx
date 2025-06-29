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
   comments: Comment[];
   replyOf: string;
   upvotes: string[];
   downvotes: string[];
};
export type Reaction = {
   type: number;
   discussionId?: string;
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
type Comment = {
   id: string;
   content: string;
   createdAt: string;
   nameAnonymous: string;
   creator: {
      name: string;
      userCode: string;
      role: string;
      avatar: string;
      id: string;
      email: string;
      school: string;
   };
   upvotes: string[];
   downvotes: string[];
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
   const [postList, setPostList] = useState<Discussion[]>([]);
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
      const totalMessages = postList.length;
      const tempPost: any[] = []
      if (totalMessages === 0) {
         return (
            <Text
               className="text-blue_primary"
               style={{ marginHorizontal: "auto", marginVertical: "auto", fontSize: 18, marginTop: "80%" }}>
               Không có câu hỏi nào !
            </Text>
         );
      }
      const start = totalMessages >= page * 4 + 10 ? totalMessages - (page * 4 + 10) : 0;
      let numberAnonymous = 0;
      for (let i = start; i < totalMessages; i++) {
         let sender = "";
         const currentPost = postList[i];
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
         if (i > 0 && currentPost.replyOf == null) {
            const previousPostTime = new Date(postList[i - 1].createdAt);
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
         tempPost.push({
            key: currentPost.id,
            Content: currentPost.content,
            CAttendId: currentPost.cAttendId,
            Time: time,
            Creator: currentPost.creator,
            Title: currentPost.title,
            Id: currentPost.id,
            Images: currentPost.images,
            nameAnonymous: nameAnonymous,
            isResolved: currentPost.isResolved,
            reactions: currentPost.reactions,
            myId: user?.id || null,
            replyOf: currentPost.replyOf,
            upvotes: currentPost.upvotes || [],
            downvotes: currentPost.downvotes || []
         })

      }
      tempPost.sort((a: any, b: any) => new Date(a.Time).getTime() - new Date(b.Time).getTime())
      const listFilter = tempPost.map((item: any) => {
         if (!item.replyOf) {
            const comments = tempPost
               .filter((post: any) => post.replyOf === item.Id)
               .map((post: any) => ({
                  id: post.Id,
                  content: post.Content,
                  createdAt: formatTimePost(post.Time),
                  nameAnonymous: post.nameAnonymous,
                  creator: post.Creator,
                  upvotes: post.upvotes || [],
                  downvotes: post.downvotes || []
               }));
            return {
               ...item,
               Time: formatTimePost(item.Time),
               comments: comments,
            };
         }
      }).filter((item: any) => item);
      listFilter.forEach((item: any) => {
         list.push(
            <PostDiscussionTeacher
               handleDeletePost={handleDeletePost}
               key={item.Id}
               Content={item.Content}
               CAttendId={item.CAttendId}
               Time={item.Time}
               Creator={item.Creator}
               Title={item.Title}
               Id={item.Id}
               Images={item.Images}
               nameAnonymous={item.nameAnonymous}
               isResolved={item.isResolved}
               reactions={item.reactions}
               myId={user?.id || null}
               handleKickStudent={kickStudent}
               comments={item.comments}
               upvotes={item.upvotes || []}
               downvotes={item.downvotes || []}
            />
         );
      });
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
   const kickStudent = async (studentId: string) => {
      Alert.alert(
         "Xác nhận",
         "Bạn có chắc chắn muốn mời người này ra khỏi lớp học này không?",
         [
            {
               text: "Hủy",
               style: "cancel"
            },
            {
               text: "Đồng ý",
               onPress: async () => {
                  setUploading(true)
                  const res = await post({
                     url: `${localHost}/api/v1/subject/leave`,
                     data: { studentId: studentId, subjectId: subjectId },
                     token: accessToken
                  });
                  setUploading(false)
                  if (res) {
                     if (res.status == 200) {
                        await loadPost()
                        Alert.alert('Thông báo', "Đã mời sinh viên ra khỏi lớp học thành công");
                     } else {
                        Alert.alert('Lỗi', "Đã xảy ra lỗi");
                     }
                  }
               }
            }
         ]
      );
   }
   useEffect(() => {
      loadPost();
   }, []);
   useEffect(() => {
      if (socketContext) {
         console.log('socket: ', socketContext.socket.id);
         const { socket } = socketContext;
         if (socket) {
            socket.emit('joinSubject', { userID: user?.id, subjectID: cAttendId });
            socket.on('receiveSubjectMessage', (message: Discussion) => {
               if (message.creator.id != user?.id)
                  setPostList((prevList) => [...prevList, message]);
               scrollViewRef.current?.scrollToEnd({ animated: true });
            });
            socket.on("receiveReaction", (object: any) => {
               const reaction = object.reaction;
               setPostList(prevList =>
                  prevList.map(post => {
                     if (post.id == reaction.discussionId) {
                        const newReaction: Reaction = {
                           type: reaction.type,
                           discussionId: reaction.discussionId,
                           id: reaction.id,
                           userId: {
                              id: reaction.userId.id,
                              name: reaction.userId.name,
                              userCode: reaction.userId.userCode,
                              avatar: reaction.userId.avatar
                           }
                        }
                        return {
                           ...post,
                           reactions: [...post.reactions, newReaction]
                        };
                     }
                     return post;
                  })
               );
            });
            socket.on("receiveUpdateReaction", (object: any) => {
               const reaction: Reaction = object.reaction;
               setPostList(prevList =>
                  prevList.map(post => {
                     if (post.id === reaction.discussionId) {
                        return {
                           ...post,
                           reactions: post.reactions.filter(item => item.id !== reaction.id).concat(reaction)
                        };
                     }
                     return post;
                  })
               );
            });
            socket.on('receiveDeleteMessage', (messageID: string) => {
               setPostList((prevList) => prevList.filter((message) => message.id !== messageID));
            });
            socket.on('receiveReply', (reply: Discussion) => {
               if (reply.creator.id != user?.id) {
                  setPostList((postList) => [...postList, reply]);
               }
            });
            socket.on('receiveVote', (data: any) => {
               if (data.userId != user?.id) {
                  setPostList((prevList) => prevList.map((item: Discussion) => {
                     if (item.id == data.discussionId) {
                        if (data.type == 'upvote') {
                           const check = item.upvotes.find((userId: any) => userId === data.userId);
                           return {
                              ...item,
                              upvotes: check ? item.upvotes.filter((userId: any) => userId !== data.userId) : [...item.upvotes, data.userId],
                              downvotes: item.downvotes.filter((userId: any) => userId !== data.userId)
                           };
                        } else if (data.type == 'downvote') {
                           const check = item.downvotes.find((userId: any) => userId === data.userId);
                           return {
                              ...item,
                              downvotes: check ? item.downvotes.filter((userId: any) => userId !== data.userId) : [...item.downvotes, data.userId],
                              upvotes: item.upvotes.filter((userId: any) => userId !== data.userId)
                           };
                        }
                     }
                     return { ...item, upvotes: item.upvotes, downvotes: item.downvotes }; // Return the item unchanged if no match
                  }));
               }
            });
         }
      }
      return () => {
         if (socketContext) {
            const { socket } = socketContext;
            if (socket) {
               socket.emit('leaveSubject', { userID: user?.id, subjectID: cAttendId });
               socket.off('receiveSubjectMessage');
               socket.off("receiveReaction");
               socket.off("receiveDeletePost");
               socket.off("receiveUpdateReaction");
               socket.off("receiveDeleteMessage");
               socket.off("receiveReply");
               socket.off("receiveVote");
            }
         }
      };
   }, [socketContext]);
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
