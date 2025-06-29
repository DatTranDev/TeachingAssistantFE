import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserStatCard from './UserStatCard';
import { UserStat } from './UserStatCard';

export type TopReactor = {
  totalReactions: number;
  user: { _id: string; name: string; email: string; avatar?: string };
};

export type TopParticipant = {
  totalDiscussions: number;
  user: { _id: string; name: string; email: string; avatar?: string };
};

export type TopReviewer = {
  reviewCount: number;
  user: { _id: string; name: string; email: string; avatar?: string };
};

type TabKey = 'discussions' | 'reviews' | 'reactions';

const tabs = [
  { key: 'discussions', label: 'Thảo luận' },
  { key: 'reviews', label: 'Đánh giá' },
  { key: 'reactions', label: 'Reactions' },
];

type Props = {
  topParticipants: TopParticipant[];
  topReviewers: TopReviewer[];
  topReactors: TopReactor[];
};

export default function StudentStatScreen({
  topParticipants,
  topReviewers,
  topReactors,
}: Props) {
  const [selectedTab, setSelectedTab] = useState<TabKey>('discussions');

  const renderEmpty = () => (
    <View className="items-center py-10">
      <Text className="text-gray-500 italic">No data available</Text>
    </View>
  );

  const renderList = () => {
    switch (selectedTab) {
      case 'discussions':
        return topParticipants.length > 0
          ? topParticipants.map((item, i) => (
              <UserStatCard
                user={item.user}
                type='discussions'
                key={item.user._id}
                value={item.totalDiscussions}
                top={i+1}
              />
            ))
          : renderEmpty();

      case 'reviews':
        return topReviewers.length > 0
          ? topReviewers.map((item, i) => (
              <UserStatCard
                user={item.user}
                type='reviews'
                key={item.user._id}
                value={item.reviewCount} 
                top={i+1}
              />
            ))
          : renderEmpty();

      case 'reactions':
        return topReactors.length > 0
          ? topReactors.map((item, i) => (
              <UserStatCard
                user={item.user}
                type='reactions'
                key={item.user._id}
                value={item.totalReactions}
                top={i+1}
              />
            ))
          : renderEmpty();

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <View className="flex-row justify-around mb-4 bg-gray-200 rounded-lg">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setSelectedTab(tab.key as TabKey)}
            className={`flex-1 items-center px-3 py-2 rounded-lg ${
              selectedTab === tab.key ? 'bg-blue_primary' : 'bg-gray-200'
            }`}
          >
            <Text
              className={`text-sm ${
                selectedTab === tab.key ? 'text-white font-semibold' : 'text-black'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>{renderList()}</ScrollView>
    </View>
  );
}
