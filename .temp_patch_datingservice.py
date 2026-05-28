from pathlib import Path
path = Path('src/services/datingService.ts')
text = path.read_text(encoding='utf8')
text = text.replace("const { data: { user } } = await supabase.auth.getSession();", "const { data } = await supabase.auth.getSession(); const user = data.session?.user;")
text = text.replace("msg => msg.sender_id !== user.id && !msg.read_at", "(msg: any) => msg.sender_id !== user.id && !msg.read_at")
old = "      return {\n      id: data.id,\n      name: data.display_name || 'Anonymous',\n      age: data.age || 25,\n      location: data.location || 'Bangkok',\n      photos: data.dating_photos || [],\n      bio: data.bio || '',\n      relationshipGoal: data.relationship_goals || '',\n      occupation: data.occupation,\n      education: data.education,\n      mbti: data.mbti,\n      loveLanguage: data.love_language,\n    };\n"
new = "      return {\n      id: data.id,\n      name: data.display_name || 'Anonymous',\n      age: data.age || 25,\n      location: data.location || 'Bangkok',\n      photos: data.dating_photos || [],\n      compatibility: 0,\n      lifestyleScore: 0,\n      personalityScore: 0,\n      emotionalScore: 0,\n      communicationScore: 0,\n      insights: [],\n      interests: [],\n      bio: data.bio || '',\n      relationshipGoal: data.relationship_goals || '',\n      occupation: data.occupation,\n      education: data.education,\n      mbti: data.mbti,\n      loveLanguage: data.love_language,\n    };\n"
if old in text:
    text = text.replace(old, new)
else:
    print('did not find getMyProfile return pattern')
old2 = "    return {\n      id: match.id,\n      partnerId: partner.id,\n      partnerName: partner.display_name || 'Anonymous',\n      partnerAvatar: partner.avatar_url || '',\n      compatibilityScore: match.compatibility_score || 0,\n      isUltraMatch: match.is_ultra_match || false,\n      hasConversation: match.has_conversation || false,\n      createdAt: new Date(match.created_at),\n    };\n"
new2 = "    return {\n      id: match.id,\n      partnerId: partner.id,\n      partnerName: partner.display_name || 'Anonymous',\n      partnerAvatar: partner.avatar_url || '',\n      compatibilityScore: match.compatibility_score || 0,\n      isUltraMatch: match.is_ultra_match || false,\n      lastMessage: undefined,\n      lastMessageTime: undefined,\n      unreadCount: 0,\n      hasConversation: match.has_conversation || false,\n      createdAt: new Date(match.created_at),\n    };\n"
if old2 in text:
    text = text.replace(old2, new2)
else:
    print('did not find getMatch return pattern')
path.write_text(text, encoding='utf8')
print('patched datingService.ts')
