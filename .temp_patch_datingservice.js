const fs = require('fs');
const path = require('path');
const file = path.join('src', 'services', 'datingService.ts');
let text = fs.readFileSync(file, 'utf8');
text = text.replace(/const \{ data: \{ user \} \} = await supabase\.auth\.getSession\(\);/g, 'const { data } = await supabase.auth.getSession(); const user = data.session?.user;');
text = text.replace(/msg => msg\.sender_id !== user\.id && !msg\.read_at/g, '(msg: any) => msg.sender_id !== user.id && !msg.read_at');
const oldProfileReturn = `      return {
      id: data.id,
      name: data.display_name || 'Anonymous',
      age: data.age || 25,
      location: data.location || 'Bangkok',
      photos: data.dating_photos || [],
      bio: data.bio || '',
      relationshipGoal: data.relationship_goals || '',
      occupation: data.occupation,
      education: data.education,
      mbti: data.mbti,
      loveLanguage: data.love_language,
    };
`;
const newProfileReturn = `      return {
      id: data.id,
      name: data.display_name || 'Anonymous',
      age: data.age || 25,
      location: data.location || 'Bangkok',
      photos: data.dating_photos || [],
      compatibility: 0,
      lifestyleScore: 0,
      personalityScore: 0,
      emotionalScore: 0,
      communicationScore: 0,
      insights: [],
      interests: [],
      bio: data.bio || '',
      relationshipGoal: data.relationship_goals || '',
      occupation: data.occupation,
      education: data.education,
      mbti: data.mbti,
      loveLanguage: data.love_language,
    };
`;
if (text.includes(oldProfileReturn)) {
  text = text.replace(oldProfileReturn, newProfileReturn);
} else {
  console.log('did not find getMyProfile return pattern');
}
const oldMatchReturn = `    return {
      id: match.id,
      partnerId: partner.id,
      partnerName: partner.display_name || 'Anonymous',
      partnerAvatar: partner.avatar_url || '',
      compatibilityScore: match.compatibility_score || 0,
      isUltraMatch: match.is_ultra_match || false,
      hasConversation: match.has_conversation || false,
      createdAt: new Date(match.created_at),
    };
`;
const newMatchReturn = `    return {
      id: match.id,
      partnerId: partner.id,
      partnerName: partner.display_name || 'Anonymous',
      partnerAvatar: partner.avatar_url || '',
      compatibilityScore: match.compatibility_score || 0,
      isUltraMatch: match.is_ultra_match || false,
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      hasConversation: match.has_conversation || false,
      createdAt: new Date(match.created_at),
    };
`;
if (text.includes(oldMatchReturn)) {
  text = text.replace(oldMatchReturn, newMatchReturn);
} else {
  console.log('did not find getMatch return pattern');
}
fs.writeFileSync(file, text, 'utf8');
console.log('patched datingService.ts');
