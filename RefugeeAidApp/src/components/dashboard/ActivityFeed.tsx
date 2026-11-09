import React from 'react';
import { View, Text, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '../../utils/helpers';

interface ActivityItem {
  id: string;
  type: 'document' | 'application' | 'verification' | 'notification';
  title: string;
  description?: string;
  timestamp: Date;
  status?: 'success' | 'pending' | 'error';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showAll?: boolean;
}

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  document:     'document-text-outline',
  application:  'clipboard-outline',
  verification: 'shield-checkmark-outline',
  notification: 'notifications-outline',
};

// Semantic colors (no rainbow)
const STATUS_COLOR: Record<string, string>  = { success: '#5C8A52', error: '#B3492E', pending: '#B5651D' };
const STATUS_BG:    Record<string, string>  = { success: '#E1ECDB', error: '#F4DCD3', pending: '#F3DCB8' };

export default function ActivityFeed({ activities, maxItems = 5, showAll = false }: ActivityFeedProps) {
  const list = showAll ? activities : activities.slice(0, maxItems);

  if (list.length === 0) {
    return (
      <View style={s.empty}>
        <Ionicons name="time-outline" size={36} color="#A89D8E" />
        <Text style={s.emptyText}>No recent activity</Text>
      </View>
    );
  }

  const renderItem: ListRenderItem<ActivityItem> = ({ item, index }) => {
    const color   = STATUS_COLOR[item.status || 'pending'] || '#A89D8E';
    const bg      = STATUS_BG[item.status   || 'pending'] || '#F2EBDF';
    const isLast  = index === list.length - 1;

    return (
      <View style={[s.row, !isLast && s.rowBorder]}>
        <View style={[s.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name={TYPE_ICON[item.type] || 'information-circle-outline'} size={20} color={color} />
        </View>

        <View style={s.content}>
          <Text style={s.title}>{item.title}</Text>
          {item.description && <Text style={s.desc}>{item.description}</Text>}
          <Text style={s.time}>{formatRelativeTime(item.timestamp)}</Text>
        </View>

        {/* Status indicator: icon + color (never color alone) */}
        {item.status && (
          <Ionicons
            name={item.status === 'success' ? 'checkmark-circle' : item.status === 'error' ? 'close-circle' : 'time-outline'}
            size={18}
            color={color}
            style={s.statusIcon}
          />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={s.list}
    />
  );
}

const s = StyleSheet.create({
  list:      { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E8DECF' },
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2EBDF' },
  iconWrap:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginEnd: 14, flexShrink: 0 },
  content:   { flex: 1, flexShrink: 1 },
  title:     { fontSize: 14, fontWeight: '600', color: '#2C2620', marginBottom: 2 },
  desc:      { fontSize: 13, color: '#6E6358', marginBottom: 4 },
  time:      { fontSize: 12, color: '#A89D8E' },
  statusIcon:{ marginStart: 10 },
  empty:     { alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 10, fontSize: 14, color: '#A89D8E' },
});