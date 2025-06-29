import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { images } from '@/constants/image'

export type UserStat = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};
const mapping: Record<string, string> = {
    discussions: 'thảo luận',
    reviews: 'đánh giá',
    reactions: 'reactions',
    absences: 'buổi'
};

export default function UserStatCard({ user, type, key, value, top }: { user: UserStat; type: string; key: string; value: number; top: number }) {
  return (
    <View key={key} className="flex-row items-center py-3 border-b border-gray-200">
      <Image
        source={user.avatar ? { uri: user.avatar } : images.avatarDefault}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View className="flex-1">
        <Text className="font-semibold text-base">{user.name}</Text>
        <Text className="text-gray-500">{value} {mapping[type]}</Text>
      </View>
      <Text className="text-gray-400 text-sm">
        {top > 0 ? `Top ${top}` : ''}
      </Text>
    </View>
  );
}