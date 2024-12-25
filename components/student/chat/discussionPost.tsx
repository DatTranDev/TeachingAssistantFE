import React, { useContext, useEffect, useState } from "react";
import { View, Image, Text, Modal, TouchableOpacity, Linking, Pressable, Alert } from "react-native";
import { images } from "@/constants/image";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import Octicons from "@expo/vector-icons/Octicons";
import { icons } from "@/constants/icons";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import post from "@/utils/post";
import { localHost } from "@/utils/localhost";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import deleteApi from "@/utils/delete";
import { Reaction } from "@/app/(studentDetail)/classDetail/discussionRoom";
import patch from "@/utils/patch";
import { downloadImage } from "@/utils/downloadImage";
import { SocketContext } from "@/context/SocketContext";

type Props = {
   Title: string;
   Content: string;
   Time: string;
   Id: string;
   CAttendId: string|string[];
   Images: string[];
   nameAnonymous: string;
   isResolved: boolean;
   reactions: Reaction[];
   myId: string | null;
   Creator: {
      name: string;
      userCode: string;
      role: string;
      avatar: string;
      id: string;
   };
   handleDeletePost: (Id: string) => void;
};
type ReactionShow = {
   type: number;
   count: number;
};

export default function DiscussionPost({
   Content,
   Title,
   Time,
   Id,
   CAttendId,
   Images,
   nameAnonymous,
   isResolved,
   reactions,
   myId,
   Creator,
   handleDeletePost
}: Props) {
   const authContext = useContext(AuthContext);
   const socketContext = useContext(SocketContext);
   if (!authContext) {
      return;
   }
   const { user, accessToken } = authContext;
   const [selectedImage, setSelectedImage] = useState("");
   const [modalVisible, setModalVisible] = useState(false);
   const [reactionModalVisible, setReactionModalVisible] = useState(false);
   const [myReaction, setMyReaction] = useState<Reaction | null>(
      reactions.find(item => item.userId.id == myId) || null
   );
   const [reaction, setReaction] = useState<ReactionShow[]>([]);
   const resetReaction = () => {
      const reactionCount = reactions.reduce((acc: any, item: Reaction) => {
         acc[item.type] = (acc[item.type] || 0) + 1;
         return acc;
      }, {});
      // Cập nhật state reaction với đối tượng đếm
      setReaction(
         Object.entries(reactionCount).map(([type, count]) => ({
            type: Number(type),
            count: count as number
         }))
      );
   };
   useEffect(() => {
      resetReaction();
   }, [isResolved, reactions]);
   const handleDownload = async (imageUrl: string) => {
      try {
         await Linking.openURL(imageUrl);
      } catch (error) {
         console.error("Không thể tải ảnh:", error);
      }
   };
   const addReaction = async (type: number) => {
      console.log(accessToken);
      if (myReaction) {
         if (type != myReaction.type) {
            const res = await patch({
               url: `${localHost}/api/v1/discussion/reaction/update/${myReaction.id}`,
               data: { type: type },
               token: accessToken
            });
            if (res) {
               console.log(res);
               if (res.status == 200) {
                  reactions.forEach(item => {
                     if (item.id == myReaction.id) {
                        item.type = type;
                     }
                  });
                  resetReaction();
                  setMyReaction({ ...myReaction, type: type });
                  if(socketContext)
                     {
                        const {socket}=socketContext;
                        let ins = myReaction;
                        ins.type = type;
                        ins.discussionId = Id;
                        socket.emit('sendUpdateReaction', {subjectID:CAttendId, messageID: Id,reaction: ins});
                     } 
               } else {``
                  Alert.alert("Thất bại", "Không thể cập nhật phản hồi");
               }
            }
         }
      } else {
         const res = await post({
            url: `${localHost}/api/v1/discussion/reaction/add`,
            data: { userId: myId, discussionId: Id, type: type },
            token: accessToken
         });
         if (res) {
            if (res.status == 201) {
               let newReaction: Reaction = {
                  type: type,
                  id: res.data.reaction.id,
                  userId: {
                     id: myId || "",
                     name: user?.name || "",
                     userCode: user?.userCode || "",
                     avatar: user?.avatar || ""
                  }
               };
               setMyReaction(newReaction);
               setReaction(prev => {
                  const existingReaction = prev.find(item => item.type === type);
                  if (existingReaction) {
                     return prev.map(item => (item.type === type ? { ...item, count: item.count + 1 } : item));
                  } else {
                     return [...prev, { type: type, count: 1 }];
                  }
               });
               if(socketContext)
               {
                  const {socket}=socketContext;
                  newReaction.discussionId = Id;
                  socket.emit('sendReaction', {subjectID:CAttendId, messageID: Id,reaction: newReaction});
               }
            } else {
               Alert.alert("Thất bại", "Không thể thêm phản hồi");
            }
         }
      }

      setReactionModalVisible(false);
   };
   const deletePost = async () => {
      if (myId == Creator.id) {
         const res = await deleteApi({ url: `${localHost}/api/v1/discussion/delete/${Id}`, token: accessToken });
         if (res) {
            if (res.status == 200) {
               setReactionModalVisible(false);
               Alert.alert("Thành công", "Đã xóa bài đăng");
               handleDeletePost(Id);
               if(socketContext)
               {
                  const {socket}=socketContext;
                  socket.emit('sendDeleteMessage', {subjectID:CAttendId, messageID: Id});
               }
            }
         } else {
            Alert.alert("Thất bại", "Không thể xóa bài đăng");

         }
      }
   };
   return (
      <View className="w-full ">
         <Modal
            animationType="fade"
            transparent={true}
            visible={reactionModalVisible}
            onRequestClose={() => setReactionModalVisible(false)}>
            <TouchableOpacity
               className="flex-1 justify-center items-center"
               style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
               onPress={() => setReactionModalVisible(false)}>
               {isResolved && (
                  <View className="bg-white py-3 px-4 rounded-xl">
                     <View className="flex-row gap-3">
                        <TouchableOpacity
                           onPress={() => addReaction(1)}
                           className={`p-1 ${myReaction?.type == 1 ? "bg-gray-300/50 rounded-lg" : ""}`}>
                           <Image source={icons.react1} className="w-[30px] h-[30px]" />
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={() => addReaction(2)}
                           className={`p-1 ${myReaction?.type == 2 ? "bg-gray-300 rounded-md" : ""}`}>
                           <Image source={icons.react2} className="w-[30px] h-[30px]" />
                        </TouchableOpacity>
                        <TouchableOpacity
                           onPress={() => addReaction(3)}
                           className={`p-1 ${myReaction?.type == 3 ? "bg-gray-300 rounded-md" : ""}`}>
                           <Image source={icons.react3} className="w-[30px] h-[30px]" />
                        </TouchableOpacity>
                     </View>
                  </View>
               )}
               {myId == Creator.id && (
                  <View className="mt-2 bg-white  items-center p-2 rounded-xl">
                     <TouchableOpacity onPress={deletePost} className="items-center">
                        <Feather name="trash" size={25} color="red" />
                        <Text className="text-[16px] mt-1">Xóa bài đăng</Text>
                     </TouchableOpacity>
                  </View>
               )}
            </TouchableOpacity>
         </Modal>

         <Pressable
            onPress={() => {
               if (isResolved || myId == Creator.id) setReactionModalVisible(true);
            }}
            className="w-[95%] bg-white mx-auto px-3 py-4 mt-5 rounded-md shadow-lg relative">
            <View className="flex-row mt-0 items-center">
               <View className="rounded-[30px] ml-0 w-[25px] h-[25px] overflow-hidden mt-auto">
                  <Image
                     resizeMode="cover"
                     source={
                        Creator.id == myId
                           ? Creator.avatar == "" || !Creator.avatar
                              ? images.avatarDefault
                              : { uri: Creator.avatar }
                           : images.avatarDefault
                     }
                     className="w-full h-full"
                  />
               </View>
               <Text className="text-blue_primary ml-2 text-[15px]">{nameAnonymous}</Text>
               <Text className="ml-2 text-[12px] text-center font-mregular mt-[1px] text-gray_primary">{Time}</Text>
            </View>
            <Text className="text-xl font-msemibold mt-2 ml-1">{Title}</Text>
            <Text className="mt-1 ml-1 text-[15px] font-mregular">{Content}</Text>
            <View className="flex-row flex-wrap mt-2 px-2 ">
               {Images.map((image, index) => (
                  <TouchableOpacity
                     key={index}
                     className="mb-2 relative rounded-md border border-gray-200 w-[30%] mr-[3.3%]"
                     onPress={() => {
                        setSelectedImage(image);
                        setModalVisible(true);
                     }}>
                     <Image source={{ uri: image }} className="w-full aspect-square rounded-md" />
                  </TouchableOpacity>
               ))}
            </View>
            <View className="flex-row gap-[1px] -mb-2 ml-1 mt-[4px] ">
               {reaction.map((item, index) => (
                  <View key={index} className="flex-row items-center">
                     <Image
                        source={item.type === 1 ? icons.react1 : item.type === 2 ? icons.react2 : icons.react3}
                        className="w-[25px] h-[25px]"
                     />
                     <Text className="text-[16px] ml-[3px] mr-[5px] text-gray-400">{item.count}</Text>
                  </View>
               ))}
            </View>
            {isResolved && (
               <View className="absolute px-2 py-1 bottom-[-12px] right-0 bg-white border border-gray-200 rounded-md shadow-lg flex-row items-center">
                  <Text className=" text-[#34eb75]  rounded-md mr-1">Đã trả lời</Text>
                  <Feather name="check" size={20} color="#34eb75" />
               </View>
            )}

            <Modal
               animationType="fade"
               transparent={true}
               visible={modalVisible}
               onRequestClose={() => setModalVisible(false)}>
               <View className="relative p-0 m-0 w-full h-full" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
                  <View className="flex-row absolute top-2 right-3 z-50">
                     <TouchableOpacity
                        className="ml-auto mr-[6px] bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
                        onPress={() => downloadImage(selectedImage)}>
                        <Octicons name="download" size={23} color={colors.blue_primary} />
                     </TouchableOpacity>
                     <TouchableOpacity
                        className="ml-auto bg-gray-300/60 rounded-full w-[32px] h-[32px] items-center justify-center"
                        onPress={() => setModalVisible(false)}>
                        <AntDesign name="close" size={23} color="red" />
                     </TouchableOpacity>
                  </View>

                  <View className="w-full h-[85%] my-auto">
                     <Image
                        className="w-full h-full"
                        source={{ uri: selectedImage }}
                        style={{ resizeMode: "contain" }}
                     />
                  </View>
               </View>
            </Modal>
         </Pressable>
      </View>
   );
}
